package com.milite.util;

public class KoreanUtil {
	public static String getJosa(String word, String josaWithBatchim, String josaWithoutBatchim) {
		if (word == null || word.isEmpty()) {
			return "";
		}
		char lastChar = word.charAt(word.length() - 1);
		if (hasBatchim(lastChar)) {
			return josaWithBatchim;
		} else {
			return josaWithoutBatchim;
		}
	}

	private static boolean hasBatchim(char ch) {
		return (ch - 0xAC00) % 28 != 0;
	}
}
