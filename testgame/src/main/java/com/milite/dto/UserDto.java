package com.milite.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
	private String ID;
	private String Password;
	private int gold;
	private String Owned_SkinID; // JSON은 문자열로 매핑
}