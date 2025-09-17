package com.milite.controller;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.milite.dto.SkinGachaDto;
import com.milite.service.SkinGachaService;

import lombok.Setter;

@RestController
@RequestMapping("/SkinGacha")
@CrossOrigin(origins = "http://localhost:3000")
public class SkinGachaController {
    @Setter(onMethod_ = @Autowired)
    private SkinGachaService service;

    @GetMapping("/AddSkin")
    public ResponseEntity<?> AddSkin(@RequestParam String userId) {
        try {
            SkinGachaDto skin = service.AddSkin(userId);
            return ResponseEntity.ok(skin);
        }
        catch (RuntimeException e) {
            if ("골드가 부족합니다".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of(
                        "error", "골드가 부족합니다",
                        "errorImage", "/images/not_gold.png"
                    )
                );
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "에러가 발생했습니다")
            );
        }
    }

    @GetMapping("/ViewUserSkin")
    public ArrayList<SkinGachaDto> ViewUserSkin(@RequestParam String userId) {
        return service.ViewUserSkin(userId);
    }

    @GetMapping("/ViewUserGold")
    public int ViewUserGold(@RequestParam String userId) {
        return service.ViewUserGold(userId);
    }

    @PostMapping("/BuyGold")
    public void BuyGold(@RequestParam String userId) {
        service.BuyGold(userId);
    }
}