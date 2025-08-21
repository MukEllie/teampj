package com.milite.mapper;

import com.milite.dto.BattleResultDto;

public interface BattleMapper {
	public BattleResultDto battle(Integer Atker, Integer Defer);
	public void testreset();
}
