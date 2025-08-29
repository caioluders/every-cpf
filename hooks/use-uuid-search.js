import React from "react";
import { uuidToIndex, indexToUUID } from "../lib/uuidTools";
import { MAX_UUID } from "../lib/constants";

const SEARCH_LOOKBACK = 50;
const SEARCH_LOOKAHEAD = 25;
const RANDOM_SEARCH_ITERATIONS = 100;

export function useUUIDSearch({ virtualPosition, displayedUUIDs }) {
  const [search, setSearch] = React.useState(null);
  const [uuid, setUUID] = React.useState(null);
  // Stack of complete states we've seen
  const [nextStates, setNextStates] = React.useState([]);

  const previousUUIDs = React.useMemo(() => {
    let hasComputed = false;
    let value = null;
    const getValue = () => {
      const compute = () => {
        const prev = [];
        for (let i = 1; i <= SEARCH_LOOKBACK; i++) {
          i = BigInt(i);
          let index = BigInt(virtualPosition) - i;
          if (index < 0n) {
            index = MAX_UUID + index;
          }
          const uuid = indexToUUID(index);
          prev.push({ index, uuid });
        }
        return prev;
      };
      if (!hasComputed) {
        value = compute();
        hasComputed = true;
      }
      return value;
    };
    return getValue;
  }, [virtualPosition]);

  const nextUUIDs = React.useMemo(() => {
    let hasComputed = false;
    let value = null;
    const getValue = () => {
      const compute = () => {
        const next = [];
        for (let i = 1; i <= SEARCH_LOOKAHEAD; i++) {
          i = BigInt(i);
          let index = virtualPosition + i;
          if (index > MAX_UUID) {
            index = index - MAX_UUID;
          }
          const uuid = indexToUUID(index);
          next.push({ index, uuid });
        }
        return next;
      };
      if (!hasComputed) {
        value = compute();
        hasComputed = true;
      }
      return value;
    };
    return getValue;
  }, [virtualPosition]);

  const searchAround = React.useCallback(
    ({ input, wantHigher, canUseCurrentIndex }) => {
      const digits = input.replace(/\D/g, "");
      if (wantHigher) {
        const startPosition = canUseCurrentIndex ? 0 : 1;
        for (let i = startPosition; i < displayedUUIDs.length; i++) {
          const uuid = displayedUUIDs[i].uuid;
          if (uuid.includes(digits)) {
            return { uuid, index: displayedUUIDs[i].index };
          }
        }
        const next = nextUUIDs();
        for (let i = 0; i < next.length; i++) {
          const uuid = next[i].uuid;
          if (uuid.includes(digits)) {
            return { uuid, index: nextUUIDs[i].index };
          }
        }
      } else {
        // canUseCurrentIndex isn't relevant when searching backwards!
        const prev = previousUUIDs();
        for (const { uuid: prevUuid, index } of prev) {
          if (prevUuid.includes(digits)) {
            return { uuid: prevUuid, index };
          }
        }
      }
      return null;
    },
    [displayedUUIDs, previousUUIDs, nextUUIDs]
  );

  const searchRandomly = React.useCallback(
    ({ input, wantHigher }) => {
      const digits = input.replace(/\D/g, "");
      let best = null;
      let compareIndex = virtualPosition;
      for (let i = 0; i < RANDOM_SEARCH_ITERATIONS; i++) {
        const randomIndex = BigInt(
          Math.floor(Math.random() * Number(MAX_UUID))
        );
        const uuid = indexToUUID(randomIndex);
        if (!uuid || !uuid.includes(digits)) continue;
        const index = randomIndex;
        const satisfiesConstraint = wantHigher
          ? index > compareIndex
          : index < compareIndex;
        const notInHistory = !nextStates.some(
          ({ uuid: nextUUID }) => nextUUID === uuid
        );
        if (satisfiesConstraint && notInHistory) {
          const isBetter =
            best === null
              ? true
              : wantHigher
                ? index < best.index
                : index > best.index;
          if (isBetter) {
            best = { uuid, index };
          }
        }
      }
      if (best) return best;
      return null;
    },
    [nextStates, uuid, virtualPosition]
  );

  const searchUUID = React.useCallback(
    (input) => {
      const newSearch = input.replace(/\D/g, "");
      if (!newSearch) return null;

      // Clear next states stack when search changes
      setNextStates([]);

      // If full CPF (11 digits), jump directly
      if (newSearch.length === 11) {
        const idx = uuidToIndex(newSearch);
        if (idx !== null) {
          setSearch(newSearch);
          setUUID(newSearch);
          setNextStates([{ uuid: newSearch, index: idx }]);
          return newSearch;
        }
        // fall through to partial search if invalid CPF
      }

      const inner = () => {
        const around = searchAround({
          input: newSearch,
          wantHigher: true,
          canUseCurrentIndex: true,
        });
        if (around) return around;
        return searchRandomly({ input: newSearch, wantHigher: true });
      };

      const result = inner();
      if (result) {
        setSearch(newSearch);
        setUUID(result.uuid);
        setNextStates((prev) => [...prev, result]);
      }
      return result?.uuid ?? null;
    },
    [searchAround, searchRandomly]
  );

  const nextUUID = React.useCallback(() => {
    if (!uuid || !search) return null;
    const inner = () => {
      const around = searchAround({
        input: search,
        wantHigher: true,
        canUseCurrentIndex: false,
      });
      if (around) return around;
      return searchRandomly({ input: search, wantHigher: true });
    };
    const result = inner();
    if (result) {
      setUUID(result.uuid);
      setNextStates((prev) => [...prev, result]);
      return result.uuid;
    }
    return null;
  }, [uuid, search, searchAround, searchRandomly]);

  const previousUUID = React.useCallback(() => {
    if (!uuid || !search) return null;

    if (nextStates.length > 1) {
      setNextStates((prev) => prev.slice(0, -1));
      const prevState = nextStates[nextStates.length - 2];
      setUUID(prevState.uuid);
      return prevState.uuid;
    }

    const inner = () => {
      const around = searchAround({
        input: search,
        wantHigher: false,
        canUseCurrentIndex: false,
      });
      if (around) return around;
      return searchRandomly({ input: search, wantHigher: false });
    };
    const result = inner();
    if (result) {
      setUUID(result.uuid);
      return result.uuid;
    }
    return null;
  }, [uuid, search, nextStates, searchAround, searchRandomly]);

  return {
    searchUUID,
    nextUUID,
    previousUUID,
    currentUUID: uuid,
  };
}

