package com.milite.util;

import java.util.*;
import java.util.stream.Collectors;

public class StringUtil {
	public static List<String> splitCommaString(String commaString) {
		if (commaString == null || commaString.trim().isEmpty()) {
			return new ArrayList<>();
		}

		return Arrays.stream(commaString.split(",")).map(String::trim).filter(s -> !s.isEmpty())
				.collect(Collectors.toList());
	}

	public static String joinWithComma(List<String> list) {
		if (list == null || list.isEmpty()) {
			return "";
		}

		return list.stream().filter(Objects::nonNull).map(String::trim).filter(s -> !s.isEmpty())
				.collect(Collectors.joining(","));
	}

	public static String addToCommaString(String originalString, String newElement) {
		if (newElement == null || newElement.trim().isEmpty()) {
			return originalString;
		}

		List<String> list = splitCommaString(originalString);
		String trimmedElement = newElement.trim();

		if (!list.contains(trimmedElement)) {
			list.add(trimmedElement);
		}
		return joinWithComma(list);
	}

	public static String removeFromCommaString(String originalString, String elementToRemove) {
		if (elementToRemove == null || elementToRemove.trim().isEmpty()) {
			return originalString;
		}

		List<String> list = splitCommaString(originalString);
		list.remove(elementToRemove.trim());

		return joinWithComma(list);
	}

	public static boolean containsInCommaString(String commaString, String element) {
		if (element == null || element.trim().isEmpty()) {
			return false;
		}

		List<String> list = splitCommaString(commaString);
		return list.contains(element.trim());
	}

	public static List<String> getIntersection(String string1, String string2) {
		List<String> list1 = splitCommaString(string1);
		List<String> list2 = splitCommaString(string2);

		return list1.stream().filter(list2::contains).collect(Collectors.toList());
	}

	public static List<String> getDifference(String string1, String string2) {
		List<String> list1 = splitCommaString(string1);
		List<String> list2 = splitCommaString(string2);

		return list1.stream().filter(item -> !list2.contains(item)).collect(Collectors.toList());
	}

	public static boolean isValidCommaString(String commaString) {
		if (commaString == null) {
			return true;
		}

		if (commaString.trim().isEmpty()) {
			return true;
		}

		return !commaString.matches(".*,,.*") && !commaString.startsWith(",") && !commaString.endsWith(",");
	}

	public static String normalizeCommaString(String commaString) {
		List<String> list = splitCommaString(commaString);

		return list.stream().distinct().sorted().collect(Collectors.joining(","));
	}
}
