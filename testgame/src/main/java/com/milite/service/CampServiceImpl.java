package com.milite.service;

import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;

@Service
public class CampServiceImpl implements CampService {
	@Override
	public boolean decideBattleOrEvent() {
		return ThreadLocalRandom.current().nextDouble() < 0.7;
	}
}