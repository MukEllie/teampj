package com.milite.util;

public class SkinGachaUtil {
	static private boolean CHANCE_REVEAL = true;
	
	static public int roll(int n) {
		int r = (int)(Math.random()*n+1);
		if(CHANCE_REVEAL) System.out.println(String.format("<1~%s 중 %s 나옴>", n, r));
		return r;
	}
	static public int roll(int min, int max) {
		int n = max - min + 1;
		int r = (int)(Math.random()*n+min);
		if(CHANCE_REVEAL) System.out.println(String.format("<%s ~ %s 중 %s 나옴>", min, max, r));
		return r;
	}
	//100 % 중 n 확률에 걸리면 true 리턴
	static public boolean percent(int n) {
		boolean b = false;
		int r = roll(1,100);
		if(r <= n) b = true;
		return b;
	}
	//1000 % 중 n 확률에 걸리면 true 리턴
	static public boolean percent1000(int n) {
		boolean b = false;
		int r = roll(1,1000);
		if(r <= n) b = true;
		return b;
	}
	//10000 % 중 n 확률에 걸리면 true 리턴
	static public boolean percent10000(int n) {
		boolean b = false;
		int r = roll(1,10000);
		if(r <= n) b = true;
		return b;
	}
}