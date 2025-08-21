package com.milite.util;

public class CommonUtil {
	public static int Dice(int n) {
		int r = (int) (Math.random() * n) + 1;
		return r;
	}

	public static String Card(int C, int H, int R, int L) {

		if (L + R + H + C != 100) {
			String Result;
			Result = "확률 설정 오류";
			return Result;
		} else {
			String Rarity = null;
			int r = Dice(L + R + H + C);

			if (r <= L) {
				Rarity = "Legendary";
			} else if (r <= L + R) {
				Rarity = "Rare";
			} else if (r <= L + R + H) {
				Rarity = "High";
			} else if (r <= L + R + H + C) {
				Rarity = "Common";
			}
			return Rarity;
		}

	}
}
