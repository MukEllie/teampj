package com.peisia.mapper;

import java.util.List;

import com.peisia.dto.EventDto;

public interface EventMapper {
	EventDto getEvent(int id);

	List<Integer> getEventIdsByTypes(List<Integer> types);
}