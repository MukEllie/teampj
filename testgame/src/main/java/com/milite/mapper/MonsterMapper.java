package com.milite.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.milite.dto.MonsterDto;

public interface MonsterMapper {
	public List<MonsterDto> MonsterList(@Param("session") String session, @Param("type") String type);
	public MonsterDto SummonServant();
	public MonsterDto getMonsterByID(@Param("MonsterID") int MonsterID);
}
