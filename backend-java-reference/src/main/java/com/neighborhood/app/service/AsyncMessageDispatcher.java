package com.neighborhood.app.service;

public interface AsyncMessageDispatcher {
    <T> void dispatch(String channel, String exchange, String routingKey, T payload, Runnable fallback);
}