package com.milite.dto;

import lombok.Data;

@Data
public class SkinGachaDto {
    //유저 정보
    private String id;
    private String password;
    private int gold;

    //스킨 정보
    private int skinId;
    private String skinName;
    private String job;
    private int imageId;
}