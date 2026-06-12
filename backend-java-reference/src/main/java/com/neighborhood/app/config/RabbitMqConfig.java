package com.neighborhood.app.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 文件作用：RabbitMQ配置。 */
@Configuration
public class RabbitMqConfig {

    @Bean
    public MessageConverter rabbitMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.messaging.rabbit", name = "enabled", havingValue = "true")
    public Queue notificationQueue(@Value("${app.messaging.rabbit.notification-queue}") String queueName) {
        return new Queue(queueName, true);
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.messaging.rabbit", name = "enabled", havingValue = "true")
    public DirectExchange notificationExchange(@Value("${app.messaging.rabbit.notification-exchange}") String exchangeName) {
        return new DirectExchange(exchangeName, true, false);
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.messaging.rabbit", name = "enabled", havingValue = "true")
    public Binding notificationBinding(
            Queue notificationQueue,
            DirectExchange notificationExchange,
            @Value("${app.messaging.rabbit.notification-routing-key}") String routingKey) {
        return BindingBuilder.bind(notificationQueue).to(notificationExchange).with(routingKey);
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.messaging.rabbit", name = "enabled", havingValue = "true")
    public Queue adminLogQueue(@Value("${app.messaging.rabbit.admin-log-queue}") String queueName) {
        return new Queue(queueName, true);
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.messaging.rabbit", name = "enabled", havingValue = "true")
    public DirectExchange adminLogExchange(@Value("${app.messaging.rabbit.admin-log-exchange}") String exchangeName) {
        return new DirectExchange(exchangeName, true, false);
    }

    @Bean
    @ConditionalOnProperty(prefix = "app.messaging.rabbit", name = "enabled", havingValue = "true")
    public Binding adminLogBinding(
            Queue adminLogQueue,
            DirectExchange adminLogExchange,
            @Value("${app.messaging.rabbit.admin-log-routing-key}") String routingKey) {
        return BindingBuilder.bind(adminLogQueue).to(adminLogExchange).with(routingKey);
    }
}
