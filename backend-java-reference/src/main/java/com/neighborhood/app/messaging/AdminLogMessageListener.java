package com.neighborhood.app.messaging;

import com.neighborhood.app.service.AdminLogWriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.messaging.rabbit", name = "enabled", havingValue = "true")
public class AdminLogMessageListener {

    private final AdminLogWriteService adminLogWriteService;

    @RabbitListener(queues = "${app.messaging.rabbit.admin-log-queue}")
    public void consume(AdminLogMessage message) {
        if (AdminLogMessage.TYPE_LOGIN.equals(message.getType())) {
            adminLogWriteService.saveLoginLog(message);
            return;
        }
        adminLogWriteService.saveOperationLog(message);
    }
}
