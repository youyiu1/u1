/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

package com.neighborhood.app.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.neighborhood.app.entity.system.Category;
import com.neighborhood.app.mapper.system.CategoryMapper;
import com.neighborhood.app.service.CategoryService;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/** 文件作用：分类服务实现。 */
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    private static final String CATEGORY_LIST_CACHE_KEY = "'category:list'";

    @Override
    @Cacheable(cacheNames = "hotData", key = CATEGORY_LIST_CACHE_KEY)
    public List<Category> list() {
        return super.list();
    }

    @Override
    @CacheEvict(cacheNames = "hotData", key = CATEGORY_LIST_CACHE_KEY)
    public boolean save(Category entity) {
        return super.save(entity);
    }

    @Override
    @CacheEvict(cacheNames = "hotData", key = CATEGORY_LIST_CACHE_KEY)
    public boolean updateById(Category entity) {
        return super.updateById(entity);
    }
}
