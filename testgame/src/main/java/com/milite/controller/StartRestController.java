package com.milite.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.milite.dto.CharacterDto;
import com.milite.dto.PlayerDto;
import com.milite.service.StartService;
import com.milite.service.StartService.StartState;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/start")
public class StartRestController {

	private final StartService startService;

	/** 시작 상태 조회 */
	@GetMapping("/state")
	public ResponseEntity<ApiResponse<StateDto>> state(@RequestParam String userId) {
		StartState s = startService.getStartState(userId);
		StateDto dto = new StateDto();
		dto.setUserExists(s.userExists);
		dto.setHasSave(s.hasSave);
		dto.setSession(s.session);
		dto.setStage(s.stage);
		dto.setPlayer(s.player);
		return ResponseEntity.ok(ApiResponse.ok("상태 조회 완료", dto));
	}

	/** Warrior, Mage, Thief 3개 반환 */
	@GetMapping("/options")
	public ResponseEntity<ApiResponse<List<CharacterDto>>> options() {
		return ResponseEntity.ok(ApiResponse.ok("선택지 조회 완료", startService.getFixedClassOptions()));
	}

	/** 직업 선택 적용 */
	@PostMapping(value = "/choose", consumes = { MediaType.APPLICATION_FORM_URLENCODED_VALUE,
			MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<ApiResponse<String>> choose(@RequestParam String userId, @RequestParam String className) {
		String msg = startService.chooseClass(userId, className);
		return ResponseEntity.ok(ApiResponse.ok(msg, null));
	}

	/** 상태 DTO */
	@Data
	static class StateDto {
		private boolean userExists; // 사용자 존재 여부
		private boolean hasSave; // 세이브 존재 여부
		private String session; // 현재 계층(Water/Fire/Grass)
		private Integer stage; // 현재 스테이지(정수)
		private PlayerDto player; // 플레이어 정보
	}

	/** API 응답 래퍼 */
	@Data
	static class ApiResponse<T> {
		private boolean success;
		private String message;
		private T data;

		static <T> ApiResponse<T> ok(String message, T data) {
			ApiResponse<T> r = new ApiResponse<>();
			r.success = true;
			r.message = message;
			r.data = data;
			return r;
		}

		static <T> ApiResponse<T> fail(String message) {
			ApiResponse<T> r = new ApiResponse<>();
			r.success = false;
			r.message = message;
			return r;
		}
	}
}