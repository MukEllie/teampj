package com.milite.service;

import java.util.ArrayList;
import com.milite.dto.SkinGachaDto;

public interface SkinGachaService {
    SkinGachaDto AddSkin(String userId);
    ArrayList<SkinGachaDto> ViewUserSkin(String userId);
    int ViewUserGold(String userId);
    void BuyGold(String userId);
}