package com.milite.mapper;

import java.util.List;
import com.milite.dto.MonsterDto;

public interface MonsterMapper {
	public List<MonsterDto> MonsterList(String session, String type);
	public MonsterDto SummonServant();
}
