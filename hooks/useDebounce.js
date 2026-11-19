"use client";

import { useEffect, useState } from "react";

export default function useDebounce(value, delay = 500) {
  const [debounceValue, setDebounceValue] = useState(value);
  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebounceValue(value);
    }, delay);
    return () => clearTimeout(debounce);
  }, [delay, value]);

  return debounceValue;
}
