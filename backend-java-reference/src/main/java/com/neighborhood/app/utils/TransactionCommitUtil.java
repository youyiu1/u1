package com.neighborhood.app.utils;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** 事务提交后执行工具，避免事务未提交时提前触发外部副作用。 */
public final class TransactionCommitUtil {

    private TransactionCommitUtil() {
    }

    public static void runAfterCommitOrNow(Runnable task) {
        if (task == null) {
            return;
        }
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            task.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                task.run();
            }
        });
    }
}
