package com.milite.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class GameController {
    
    @GetMapping("/test")
    public String test() {
        System.out.println("API 테스트 요청이 들어왔습니다!");
        return "STS-React 연결 성공!";
    }
}