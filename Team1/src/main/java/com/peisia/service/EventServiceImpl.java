package com.peisia.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.peisia.c.util.Dice;
import com.peisia.dto.EventDto;
import com.peisia.dto.PlayerDto;
import com.peisia.mapper.EventMapper;
import com.peisia.mapper.PlayerMapper;

@Service
public class EventServiceImpl implements EventService {

	@Autowired
	private EventMapper eventMapper;

	@Autowired
	private PlayerMapper playerMapper;

	// STS 내에서 별도 관리하는 플레이어 골드
	private int playerGold = 0;

	// 던전 레벨별 랜덤 이벤트 선택 (인트로 화면용)
	@Override
	public EventDto pickEvent(int dungeonLevel) {
		List<Integer> allowedTypes = new ArrayList<>();
		allowedTypes.add(0); // 공용 이벤트 포함

		switch (dungeonLevel) {
		case 1:
			allowedTypes.add(1);
			break; // Water
		case 2:
			allowedTypes.add(2);
			break; // Fire
		case 3:
			allowedTypes.add(3);
			break; // Leaf
		default:
			break;
		}

		List<Integer> eventIds = eventMapper.getEventIdsByTypes(allowedTypes);
		if (eventIds == null || eventIds.isEmpty()) {
			System.out.println("허용 이벤트가 없음");
			return null;
		}

		int randomIndex = Dice.roll(eventIds.size()) - 1;
		int selectedEventId = eventIds.get(randomIndex);

		EventDto event = eventMapper.getEvent(selectedEventId);
		if (event == null) {
			System.out.println("선택된 이벤트가 없음");
			return null;
		}
		return event;
	}

	// 이벤트 ID로 이벤트 조회 (결과 화면용)
	@Override
	public EventDto getEventById(int eventId) {
		return eventMapper.getEvent(eventId);
	}

	// 이벤트 효과를 플레이어에게 적용하고 플레이어 상태 업데이트 및 반환
	@Override
	public PlayerDto applyEventToPlayer(EventDto event, int playerId) {
		if (event == null)
			return null;

		PlayerDto player = playerMapper.getPlayerById(playerId);
		if (player == null) {
			System.out.println("플레이어 없음, playerId: " + playerId);
			return null;
		}

		int diceResult = event.getE_dice() > 0 ? Dice.roll(event.getE_dice()) : 0;
		event.setEffectDiceResult(diceResult); // 저장해두기

		// 체력 변화
		int hpChange = (int) (player.getP_maxhp() * (event.getE_phealth() / 100.0));
		player.setP_currenthp(player.getP_currenthp() + hpChange);
		if (player.getP_currenthp() > player.getP_maxhp())
			player.setP_currenthp(player.getP_maxhp());
		if (player.getP_currenthp() < 0)
			player.setP_currenthp(0);

		// 공격력 변화
		player.setP_atk(player.getP_atk() + event.getE_patk() * diceResult);

		// 운 변화
		player.setP_luck(player.getP_luck() + event.getE_luck());

		// 골드 변화 (별도 관리)
		playerGold += event.getE_gold();

		// 플레이어 DB 업데이트
		playerMapper.updatePlayer(player);

		// 효과 수치 이벤트 DTO에 기록 (결과 화면에서 활용)
		event.setEffectPhealth(hpChange);
		event.setEffectPatk(event.getE_patk() * diceResult);
		event.setEffectLuck(event.getE_luck());
		event.setEffectGold(event.getE_gold());
		event.setEffectMhealth((int) (200 * (event.getE_mhealth() / 100.0)));

		return player;
	}

	/**
	 * 기존 getProcessedEvent 메서드: 던전 레벨과 플레이어 ID로 이벤트를 선택하고, 플레이어에게 바로 적용 후 이벤트 DTO
	 * 반환
	 */
	@Override
	public EventDto getProcessedEvent(int dungeonLevel, int playerId) {
		List<Integer> allowedTypes = new ArrayList<>();
		allowedTypes.add(0); // 공용 이벤트 포함

		switch (dungeonLevel) {
		case 1:
			allowedTypes.add(1);
			break;
		case 2:
			allowedTypes.add(2);
			break;
		case 3:
			allowedTypes.add(3);
			break;
		default:
			break;
		}

		List<Integer> eventIds = eventMapper.getEventIdsByTypes(allowedTypes);
		if (eventIds == null || eventIds.isEmpty()) {
			System.out.println("허용 이벤트가 없음");
			return null;
		}

		int randomIndex = Dice.roll(eventIds.size()) - 1;
		int selectedEventId = eventIds.get(randomIndex);

		EventDto event = eventMapper.getEvent(selectedEventId);
		if (event == null) {
			System.out.println("선택된 이벤트가 없음");
			return null;
		}

		PlayerDto player = playerMapper.getPlayerById(playerId);
		if (player == null) {
			System.out.println("플레이어 없음, playerId: " + playerId);
			return null;
		}

		int diceResult = event.getE_dice() > 0 ? Dice.roll(event.getE_dice()) : 0;
		event.setEffectDiceResult(diceResult);

		int hpChange = (int) (player.getP_maxhp() * (event.getE_phealth() / 100.0));
		player.setP_currenthp(player.getP_currenthp() + hpChange);
		if (player.getP_currenthp() > player.getP_maxhp())
			player.setP_currenthp(player.getP_maxhp());
		if (player.getP_currenthp() < 0)
			player.setP_currenthp(0);

		player.setP_atk(player.getP_atk() + event.getE_patk() * diceResult);
		player.setP_luck(player.getP_luck() + event.getE_luck());

		playerGold += event.getE_gold();

		playerMapper.updatePlayer(player);

		int monsterHpChange = (int) (200 * (event.getE_mhealth() / 100.0));

		event.setEffectPhealth(hpChange);
		event.setEffectPatk(event.getE_patk() * diceResult);
		event.setEffectLuck(event.getE_luck());
		event.setEffectGold(event.getE_gold());
		event.setEffectMhealth(monsterHpChange);

		return event;
	}

	@Override
	public int getPlayerGold() {
		return playerGold;
	}
}