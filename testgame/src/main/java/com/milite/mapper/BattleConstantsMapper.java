package com.milite.mapper;

import java.util.List;
import java.util.Map;

public interface BattleConstantsMapper {
	public List<Map<String, Object>> getAllConstants();

	public List<Map<String, Object>> getTypeConstants(String type);

	public Double getNameConstants(String name);

}
