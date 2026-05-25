/**
 * MySQL JSON 字段专用 TypeHandler
 *
 * @license Apache-2.0
 */
package com.neighborhood.app.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class MySqlJsonTypeHandler extends BaseTypeHandler<List<String>> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, List<String> parameter, JdbcType jdbcType) throws SQLException {
        if (parameter == null || parameter.isEmpty()) {
            ps.setString(i, "[]");
        } else {
            try {
                ps.setString(i, MAPPER.writeValueAsString(parameter));
            } catch (JsonProcessingException e) {
                ps.setString(i, "[]");
            }
        }
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName) throws SQLException {
        return parseFromResultSet(rs, columnName);
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        return parseFromResultSetByIndex(rs, columnIndex);
    }

    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        return parseObject(cs.getObject(columnIndex));
    }

    private List<String> parseFromResultSet(ResultSet rs, String columnName) throws SQLException {
        try {
            String str = rs.getString(columnName);
            if (str != null) return parseJson(str);
        } catch (Exception ignored) {}
        try {
            Object obj = rs.getObject(columnName);
            return parseObject(obj);
        } catch (Exception ignored) {}
        return new ArrayList<>();
    }

    private List<String> parseFromResultSetByIndex(ResultSet rs, int columnIndex) throws SQLException {
        try {
            String str = rs.getString(columnIndex);
            if (str != null) return parseJson(str);
        } catch (Exception ignored) {}
        try {
            Object obj = rs.getObject(columnIndex);
            return parseObject(obj);
        } catch (Exception ignored) {}
        return new ArrayList<>();
    }

    private List<String> parseObject(Object obj) {
        if (obj == null) return new ArrayList<>();
        String json;
        if (obj instanceof String) {
            json = (String) obj;
        } else {
            json = obj.toString();
        }
        return parseJson(json);
    }

    private List<String> parseJson(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        try {
            List<String> result = new ArrayList<>();
            ArrayNode arrayNode = (ArrayNode) MAPPER.readTree(json);
            for (var node : arrayNode) {
                result.add(node.asText());
            }
            return result;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}