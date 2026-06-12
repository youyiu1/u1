package com.neighborhood.app.aspect;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** 管理端操作审计注解，用于需要自定义动作名称的管理接口。 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AdminOperationAudit {
    String action() default "";

    String target() default "";
}
