package com.milite.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.milite.mapper.BattleConstantsMapper;

import lombok.Setter;
import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class BattleConstantsService {

	@Setter(onMethod_ = @Autowired)
	private BattleConstantsMapper mapper;

	// 캐시 저장
	private final Map<String, Double> constantsCache = new ConcurrentHashMap<>();

	@PostConstruct
	public void initializeConstants() {
		loadEssentialConstants();
	}

	private void loadEssentialConstants() {
		try {
			String[] essentialTypes = { "SYSTEM", "ELEMENT", "MONSTER", "STATUS", "ARTIFACT" };

			for (String type : essentialTypes) {
				List<Map<String, Object>> results = mapper.getTypeConstants(type);
				for (Map<String, Object> row : results) {
					String name = (String) row.get("name");
					Double value = ((Number) row.get("value")).doubleValue();
					constantsCache.put(name, value);
				}
				log.info(type + " 상수 로드 완료 " + results.size() + " 개");
			}
			log.info("필드 상수 초기화 완료 " + constantsCache.size() + " 개");
		} catch (Exception e) {
			log.error("필드 상수 초기화 실패", e);
		}
	}

	public double getConstant(String name) {
		Double value = constantsCache.get(name);
		if (value == null) {
			value = mapper.getNameConstants(name);
			if (value != null) {
				constantsCache.put(name, value);
				log.info("지연 로딩 " + name + " = " + value);
			} else {
				log.error("상수 미확인 " + name);
				throw new IllegalArgumentException("상수를 찾을 수 없습니다 " + name);
			}
		}
		return value;
	}

	public int getIntConstant(String name) {
		return (int) getConstant(name);
	}

	public boolean getBooleanConstant(String name) {
		return getConstant(name) > 0;
	}

	public int getCacheSize() {
		return constantsCache.size();
	}

	public boolean hasConstant(String name) {
		return constantsCache.containsKey(name);
	}

}
