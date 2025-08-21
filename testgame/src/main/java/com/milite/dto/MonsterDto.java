package com.milite.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonsterDto {
	int monsterID; //정보 요청 시, 간략화를 위한 정수 ID
	String name;
	int session; // 어느 계층에서 등장하는 몬스터인가
	String type; //일반 중간보스 최종보스
	String element; // 물, 불, 풀, 무
	int min_hp; //일반 몬스터의 랜덤 스펙
	int max_hp;
	int min_atk;
	int max_atk;
	int luck;
	String special; //몬스터의 특이점 태그
	String description;
}