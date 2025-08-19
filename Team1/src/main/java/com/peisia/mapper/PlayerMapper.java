package com.peisia.mapper;

import com.peisia.dto.PlayerDto;

public interface PlayerMapper {
	PlayerDto getPlayerById(int p_id);

	void updatePlayer(PlayerDto player);
}