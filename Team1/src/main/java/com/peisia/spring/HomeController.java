package com.peisia.spring;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HomeController {

	@RequestMapping("/")
	public String home(Model model, HttpServletRequest request) {
		// 쿠키 꺼내기
		Cookie[] cs = request.getCookies();
		if (cs != null) {
			for (Cookie cc : cs) {
				if ("cookieSavedId".equals(cc.getName())) {
					String n = cc.getValue();
					System.out.println("==== 쿠키 값 찍기: " + n);
					model.addAttribute("cookieSavedId", n);
					break;
				}
			}
		}
		return "home";
	}
}