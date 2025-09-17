package com.milite.mapper;

import java.util.ArrayList;
import com.milite.dto.SkinGachaDto;

public interface SkinGachaMapper {
    SkinGachaDto GetRandomSkin();
    void UpdateUserOwnedSkin(java.util.Map<String, Object> param);
    ArrayList<SkinGachaDto> ViewUserSkin(String userId);

    int ViewUserGold(String userId);
    int PayGold(String userId);
    void BuyGold(String userId);
}