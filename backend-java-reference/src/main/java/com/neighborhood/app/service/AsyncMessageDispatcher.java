package com.neighborhood.app.service;

/** 文件作用：异步消息Dispatcher服务接口。 */
public interface AsyncMessageDispatcher {
    <T> void dispatch(String channel, String exchange, String routingKey, T payload, Runnable fallback);
}
