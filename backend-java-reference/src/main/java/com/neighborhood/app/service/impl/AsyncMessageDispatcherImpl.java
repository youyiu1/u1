package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.AppMetricsService;
import com.neighborhood.app.service.AsyncMessageDispatcher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** 文件作用：异步消息DispatcherImpl服务实现。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncMessageDispatcherImpl implements AsyncMessageDispatcher {

    private final RabbitTemplate rabbitTemplate;
    private final AppMetricsService appMetricsService;

    @Value("${app.messaging.rabbit.enabled:false}")
    private boolean rabbitEnabled;

    @Override
    public <T> void dispatch(String channel, String exchange, String routingKey, T payload, Runnable fallback) {
        if (rabbitEnabled) {
            try {
                rabbitTemplate.convertAndSend(exchange, routingKey, payload);
                appMetricsService.recordMessageDispatch(channel, "rabbit", true);
                return;
            } catch (AmqpException ex) {
                log.warn("RabbitMQ dispatch failed, fallback to direct write. channel={}", channel, ex);
                appMetricsService.recordMessageDispatch(channel, "rabbit", false);
            }
        }
        fallback.run();
        appMetricsService.recordMessageDispatch(channel, "direct", true);
    }
}
