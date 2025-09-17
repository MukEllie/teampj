package com.milite.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.milite.dto.SkinGachaDto;
import com.milite.mapper.SkinGachaMapper;

import lombok.Setter;

@Service
public class SkinGachaServiceImpl implements SkinGachaService {
    @Setter(onMethod_ = @Autowired)
    private SkinGachaMapper mapper;

    private static final int COST = 3000; //가챠 비용

    @Override
    @Transactional
    public SkinGachaDto AddSkin(String userId) {
        int userGold = mapper.ViewUserGold(userId);
        if (userGold < COST) {
            throw new RuntimeException("골드가 부족합니다");
        }
        SkinGachaDto randomSkin = mapper.GetRandomSkin();
        Map<String, Object> param = new HashMap<>();
        param.put("skin", randomSkin);
        param.put("userId", userId);
        mapper.UpdateUserOwnedSkin(param);
        int affectedRows = mapper.PayGold(userId);
        if (affectedRows == 0) {
            throw new RuntimeException("골드 차감 실패");
        }
        return randomSkin;
    }

    @Override
    public ArrayList<SkinGachaDto> ViewUserSkin(String userId) {
        return mapper.ViewUserSkin(userId);
    }

    @Override
    public int ViewUserGold(String userId) {
        return mapper.ViewUserGold(userId);
    }

    @Override
    public void BuyGold(String userId) {
        mapper.BuyGold(userId);
    }
}
