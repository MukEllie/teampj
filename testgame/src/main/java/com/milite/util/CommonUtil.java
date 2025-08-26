package com.milite.util;

public class CommonUtil {
	public static int Dice(int n) {
		int r = (int) (Math.random() * n) + 1;
		return r;
	}

	public static String determineRarity(int srChance, int rChance, int nChance) {
		if (srChance + rChance + nChance != 100) {
			System.err.println("확률 설정 오류 : 총합이 100%가 아닙니다");
		}

		int roll = Dice(100);

		if (roll <= srChance) {
			return "SR";
		} else if (roll <= srChance + rChance) {
			return "R";
		} else {
			return "N";
		}
	}

	public static String determineRarity(int srChance, int rChance) {
		int nChance = 100 - srChance - rChance;
		return determineRarity(srChance, rChance, nChance);
	}

	public static boolean rollChance(int chance) {
		return Dice(100) <= chance;
	}
}
