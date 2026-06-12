package com.neighborhood.app.dto.common;

import lombok.Data;

/** 通用分页请求参数。 */
@Data
public class PageQueryRequest {

    private static final long DEFAULT_PAGE_NUM = 1L;
    private static final long DEFAULT_PAGE_SIZE = 10L;
    private static final long MAX_PAGE_SIZE = 50L;

    private Integer pageNum = (int) DEFAULT_PAGE_NUM;
    private Integer pageSize = (int) DEFAULT_PAGE_SIZE;

    public long normalizedPageNum() {
        if (pageNum == null || pageNum < 1) {
            return DEFAULT_PAGE_NUM;
        }
        return pageNum;
    }

    public long normalizedPageSize() {
        if (pageSize == null || pageSize < 1) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(pageSize, MAX_PAGE_SIZE);
    }
}
