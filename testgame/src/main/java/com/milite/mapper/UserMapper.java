package com.milite.mapper;

import org.apache.ibatis.annotations.Param;

import com.milite.dto.UserDto;

public interface UserMapper {
	UserDto getUserById(@Param("id") String id);

	/** 골드 증가만 수행 (감소 없음) */
	int addGold(@Param("id") String id, @Param("amount") int amount);
}