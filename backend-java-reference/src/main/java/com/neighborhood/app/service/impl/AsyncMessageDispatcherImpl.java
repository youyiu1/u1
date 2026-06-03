package com.neighborhood.app.service.impl;

import com.neighborhood.app.service.AsyncMessageDispatcher;

import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncMessageDispatcherImpl implements AsyncMessageDispatcher {

    private final RabbitTemplate rabbitTemplate;
    private final MeterRegistry meterRegistry;

    @Value("${app.messaging.rabbit.enabled:false}")
    private boolean rabbitEnabled;

    public <T> void dispatch(String channel, String exchange, String routingKey, T payload, Runnable fallback) {
        if (rabbitEnabled) {
            try {
                rabbitTemplate.convertAndSend(exchange, routingKey, payload);
                recordDispatch(channel, "rabbit");
                return;
            } catch (AmqpException ex) {
                log.warn("RabbitMQ dispatch failed, fallback to direct write. channel={}", channel, ex);
            }
        }
        fallback.run();
        recordDispatch(channel, "direct");
    }

    private void recordDispatch(String channel, String mode) {
        meterRegistry.counter("app.messaging.dispatch.count", "channel", channel, "mode", mode).increment();
    }
}
