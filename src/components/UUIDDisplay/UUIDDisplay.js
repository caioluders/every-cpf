import React from "react";
import styled, { keyframes } from "styled-components";
import UnstyledButton from "../UnstyledButton/UnstyledButton";
import { indexToUUID, intToUUID } from "../../../lib/uuidTools";
import {
  querySmallScreen,
  queryVerySmallScreen,
  SCROLLBAR_WIDTH,
  MAX_UUID,
  ITEM_HEIGHT,
  WIDTH_TO_SHOW_DOUBLE_HEIGHT,
} from "../../../lib/constants";
import { ClipboardCopy, Star } from "../Icons";
import { indexToUUID } from "../../../lib/uuidTools";

const BaseButton = styled(UnstyledButton)`
  height: 100%;
  aspect-ratio: 1;
  cursor: pointer;
  padding: 0;
  transition:
    transform 0.1s ease-in-out,
    color 0.1s ease-in-out;

  @media ${querySmallScreen} {
    height: 60%;
  }

  &:focus {
    outline: none;
    background-color: transparent;
  }

  &:selected {
    background-color: transparent;
  }

  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-tap-highlight-color: transparent;
`;

const CopyButton = styled(BaseButton)`
  grid-area: copy;

  color: var(--slate-700);

  @media (hover: hover) {
    &:hover {
      color: var(--slate-900);
    }
  }

  transform: ${(props) => (props.$rowMouseDown ? "scale(0.8)" : "none")};

  &:active {
    transform: scale(0.8);
  }
`;

const SpinStretch = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
  }

  20% {
    transform: scale(0.8) rotate(-40deg);
  }


  100% {
    transform: scale(1) rotate(360deg);
  }
`;

const FavoriteButton = styled(BaseButton)`
  grid-area: favorite;

  color: var(--yellow-700);

  --fill-color: ${(props) =>
    props.$isFaved ? "var(--yellow-500)" : "transparent"};

  &[data-just-faved="true"] {
    animation: ${SpinStretch} 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) both;
  }

  @media (hover: hover) {
    &:hover {
      color: ${(props) =>
        props.$isFaved ? "var(--yellow-100)" : "var(--yellow-500)"};
    }
  }
`;

const Wrapper = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  outline: none;

  --text-size: 0.875rem;

  @media ${queryVerySmallScreen} {
    --text-size: 0.75rem;
  }
`;

const List = styled.div`
  height: 100%;
  padding-bottom: 2rem;
`;

const TopControls = styled.div`
  position: sticky;
  top: 0;
  background: var(--slate-100);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  z-index: 5;
`;

const RowWrapper = styled.div`
  display: grid;
  padding: 0.25rem 0;

  grid-template-areas: "index colon uuid copy favorite copied";
  grid-template-rows: 100%;
  grid-template-columns: repeat(5, fit-content(15px));
  gap: 0.25rem 0.5rem;
  align-items: center;

  margin-left: ${SCROLLBAR_WIDTH}px;
  font-family: monospace;
  white-space: nowrap;
  font-size: var(--text-size);
  border-bottom: 1px solid var(--border-color);
  height: ${ITEM_HEIGHT}px;

  @media (hover: hover) {
    &:hover {
      background-color: var(--slate-400);
    }
  }

  background-color: var(--row-background, transparent);
  transition: background-color 0.1s ease-in-out;

  @media ${querySmallScreen} {
    grid-template-columns: repeat(2, fit-content(0));
    grid-template-areas: "index copy favorite" "uuid copy favorite";
    grid-template-rows: 50% 50%;
    height: ${ITEM_HEIGHT * 2}px;
    justify-content: center;
    gap: 0.25rem 0.5rem;
    padding: 0.5rem 0;
    margin-left: 0;
  }
`;

const FadeOutDown = keyframes`
  0% {
    opacity: 0;
  }

  15% {
    opacity: 1;
  }

  40% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`;

const FadeOutSide = keyframes`
  0% {
    opacity: 0;
    transform: translateX(0);
  }

  30% {
    opacity: 1;
    transform: translateX(-110%);
  }

  50% {
    opacity: 1;
    transform: translateX(-110%);
  }

  100% {
    transform: translateX(0);
  }
`;

const CopiedText = styled.div`
  grid-area: copied;
  font-size: var(--text-size);
  color: var(--green-900);
  animation: ${FadeOutDown} 0.6s ease-in both;
  user-select: none;

  @media ${querySmallScreen} {
    position: absolute;
    backdrop-filter: blur(10px);
    background-color: var(--slate-100);
    border-radius: 0.5rem;
    padding: 0.5rem;
    left: 100%;
    animation: ${FadeOutSide} 1s ease-out both;
    /* transform: translateX(-50%); */
  }
`;

const Index = styled.span`
  opacity: 0.7;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const Padding = styled.span`
  opacity: 0.3;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`;

const IndexWithPadding = styled.div`
  display: inline-block;
`;

const Colon = styled.span`
  grid-area: colon;

  &::after {
    content: "";
  }

  @media ${querySmallScreen} {
    display: none;
  }
`;

const UUID = styled.span`
  grid-area: uuid;
  color: var(--uuid-color);
  display: block;
  width: fit-content;

  @media ${querySmallScreen} {
    justify-self: end;
  }
`;

const Highlight = styled.span`
  background-color: var(--yellow-300);
`;

const StateTag = styled.span`
  margin-left: 0.5rem;
  color: var(--neutral-700);
  font-size: var(--text-size);
  opacity: 0.9;
`;

function Row({
  index,
  uuid,
  isFaved,
  toggleFavedUUID,
  search,
  searchDisplayed,
}) {
  const indexString = index.toString();
  const length = indexString.length;
  const padLength = 18;
  const paddingLength = padLength - length;
  let padding;
  if (paddingLength < 0) {
    console.error("paddingLength < 0", indexString, length, padLength);
    padding = "";
  } else {
    padding = "0".repeat(paddingLength);
  }
  const [justFaved, setJustFaved] = React.useState(null);
  const [mouseDown, setMouseDown] = React.useState(false);
  const [justCopied, setJustCopied] = React.useState(0);
  const timeoutRef = React.useRef(null);

  const formatCPF = React.useCallback((raw) => {
    const digits = (raw || "").toString().replace(/\D/g, "").padStart(11, "0");
    if (digits.length !== 11) return raw;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }, []);

  const handleCopy = React.useCallback(async () => {
    clearTimeout(timeoutRef.current);
    await navigator.clipboard
      .writeText(formatCPF(uuid))
      .catch((e) => {
        console.error("error copying to clipboard", e);
        setJustCopied(0);
      })
      .then(() => {
        setJustCopied((prev) => prev + 1);
        timeoutRef.current = setTimeout(() => {
          setJustCopied(0);
        }, 1000);
      });
  }, [uuid, formatCPF]);

  React.useEffect(() => {
    if (justFaved && justFaved !== uuid) {
      setJustFaved(null);
    }
  }, [justFaved, uuid]);

  React.useEffect(() => {
    const handleMouseUp = () => {
      if (mouseDown) {
        setMouseDown(false);
        handleCopy();
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseDown, handleCopy]);

  const formatted = formatCPF(uuid);
  const searchDigits = (search || "").replace(/\D/g, "");
  const raw = formatted.replace(/\D/g, "");
  const highlight = !!searchDigits && raw.includes(searchDigits);
  let UUIDToDisplay = formatted;
  if (highlight) {
    const start = raw.indexOf(searchDigits);
    const end = start + searchDigits.length;
    // map raw digit indices to formatted indices
    const map = [];
    let rawIdx = 0;
    for (let i = 0; i < formatted.length; i++) {
      const ch = formatted[i];
      if (/\d/.test(ch)) {
        map[rawIdx] = i;
        rawIdx++;
      }
    }
    const fStart = map[start] ?? 0;
    const fEnd = (map[end - 1] ?? formatted.length - 1) + 1;
    UUIDToDisplay = (
      <>
        {formatted.slice(0, fStart)}
        <Highlight>{formatted.slice(fStart, fEnd)}</Highlight>
        {formatted.slice(fEnd)}
      </>
    );
  }

  const REGION_BY_9TH = React.useMemo(
    () => ({
      "0": "RS",
      "1": "DF, GO, MT, MS, TO",
      "2": "AC, AM, AP, PA, RO, RR",
      "3": "CE, MA, PI",
      "4": "AL, PB, PE, RN",
      "5": "BA, SE",
      "6": "MG",
      "7": "ES, RJ",
      "8": "SP",
      "9": "PR, SC",
    }),
    []
  );
  const region = raw.length === 11 ? REGION_BY_9TH[raw[8]] : null;
  const UUIDWithState = (
    <>
      {region ? <StateTag>{region + " ".repeat(23 - region.length)}</StateTag> : null} {/* add padding to the right so the uuid is aligned */}
      {UUIDToDisplay}
    </>
  );

  return (
    <RowWrapper
      // this doesn't work well with touch-scrolling (you end up copying on accident)
      // so we just use the mouse
      onMouseDown={(e) => {
        // only trigger if the click is on the row, not on some text
        if (e.target === e.currentTarget) {
          setMouseDown(true);
        }
      }}
      style={{
        backgroundColor: mouseDown ? "var(--slate-500)" : null,
      }}
    >
      <IndexWithPadding style={{ gridArea: "index" }}>
        <Padding>{padding}</Padding>
        <Index>{indexString}</Index>
      </IndexWithPadding>
      <Colon />
      <UUID>{UUIDWithState}</UUID>
      <CopyButton onClick={handleCopy} $rowMouseDown={mouseDown}>
        <ClipboardCopy style={{ height: "100%", aspectRatio: 1 }} />
      </CopyButton>
      <FavoriteButton
        $isFaved={isFaved}
        data-just-faved={isFaved && justFaved === uuid}
        onClick={() => {
          if (!isFaved) {
            setJustFaved(uuid);
          }
          toggleFavedUUID(uuid);
        }}
      >
        <Star
          fill="var(--fill-color)"
          style={{ height: "100%", aspectRatio: 1 }}
        />
      </FavoriteButton>
      {justCopied !== 0 && <CopiedText key={justCopied}>copiado!</CopiedText>}
    </RowWrapper>
  );
}

function UUIDDisplay({
  itemsToShow,
  setItemsToShow,
  virtualPosition,
  setVirtualPosition,
  favedUUIDs,
  toggleFavedUUID,
  isAnimating,
  MAX_POSITION,
  animateToPosition,
  search,
  searchDisplayed,
  displayedUUIDs,
  randomized,
  setRandomized,
}) {
  const ref = React.useRef(null);
  // Mapping is randomized in parent via props; no side effects here

  const movePosition = React.useCallback(
    (delta) => {
      if (isAnimating) return;
      setVirtualPosition((prev) => {
        const newPos = prev + delta;
        const ret =
          newPos < 0n ? 0n : newPos > MAX_POSITION ? MAX_POSITION : newPos;
        return ret;
      });
    },
    [isAnimating, MAX_POSITION, setVirtualPosition]
  );

  React.useEffect(() => {
    if (ref.current === null) return;

    const computeItemsToShow = () => {
      const rect = ref.current.getBoundingClientRect();
      const height = rect.height;
      const width = rect.width + SCROLLBAR_WIDTH;
      const showDoubleHeight = width < WIDTH_TO_SHOW_DOUBLE_HEIGHT;
      const items = Math.floor(
        height / (showDoubleHeight ? ITEM_HEIGHT * 2 : ITEM_HEIGHT)
      );
      setItemsToShow(items);
    };
    computeItemsToShow();

    // debounce??
    window.addEventListener("resize", computeItemsToShow);
    return () => {
      window.removeEventListener("resize", computeItemsToShow);
    };
  }, [setItemsToShow]);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  React.useEffect(() => {
    if (!ref.current) return;
    const handleWheel = (e) => {
      if (isAnimating) return;
      e.preventDefault();
      movePosition(BigInt(Math.floor(e.deltaY)));
    };
    ref.current.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    let lastTouchY = 0;
    let lastTouchTime = 0;
    let velocity = 0;
    let animationFrame = null;

    const applyMomentum = () => {
      if (Math.abs(velocity) > 0.5) {
        movePosition(BigInt(Math.floor(velocity)));
        // Decay the velocity - play with these numbers to adjust the "feel"
        velocity *= 0.95;
        animationFrame = requestAnimationFrame(applyMomentum);
      } else {
        velocity = 0;
      }
    };

    const handleTouchStart = (e) => {
      lastTouchY = e.touches[0].clientY;
      lastTouchTime = Date.now();
      velocity = 0;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchY - touchY;
      const now = Date.now();
      const deltaTime = now - lastTouchTime;

      velocity = (deltaY / deltaTime) * 16.67;

      lastTouchY = touchY;
      lastTouchTime = now;

      movePosition(BigInt(Math.floor(deltaY * 2)));
    };

    const handleTouchEnd = () => {
      // Start momentum scrolling
      if (Math.abs(velocity) > 0.5) {
        animationFrame = requestAnimationFrame(applyMomentum);
      }
    };

    ref.current.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    ref.current.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    ref.current.addEventListener("touchend", handleTouchEnd, {
      passive: false,
    });

    return () => {
      if (!ref.current) return;
      ref.current.removeEventListener("wheel", handleWheel);
      ref.current.removeEventListener("touchstart", handleTouchStart);
      ref.current.removeEventListener("touchmove", handleTouchMove);
      ref.current.removeEventListener("touchend", handleTouchEnd);
    };
  }, [movePosition]);

  const handleKeyDown = React.useCallback(
    (e) => {
      if (isAnimating) return;
      const PAGE_SIZE = BigInt(itemsToShow);
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      const shiftKey = e.shiftKey;

      const handleAndPrevent = (action) => {
        e.preventDefault();
        action();
      };

      const hasKeyAndModifier = (key, modifiers = []) => {
        return e.key === key && modifiers.every((mod) => mod);
      };

      const handleKeyAndPrevent = (key, modifiers = [], action) => {
        if (hasKeyAndModifier(key, modifiers)) {
          handleAndPrevent(action);
          return true;
        }
        return false;
      };

      const animateWithDelta = (delta) => {
        let target = virtualPosition + delta;
        if (target < 0n) {
          target = 0n;
        } else if (target > MAX_POSITION) {
          target = MAX_POSITION;
        }
        animateToPosition(target);
      };

      switch (true) {
        case handleKeyAndPrevent("ArrowDown", [cmdKey], () => {
          animateWithDelta(MAX_POSITION);
        }):
          return;
        case handleKeyAndPrevent("ArrowUp", [cmdKey], () =>
          animateWithDelta(-MAX_POSITION)
        ):
          return;
        case handleKeyAndPrevent(" ", [shiftKey], () => {
          animateWithDelta(-PAGE_SIZE);
        }):
          return;
        case handleKeyAndPrevent(" ", [], () => {
          animateWithDelta(PAGE_SIZE);
        }):
          return;
        case handleKeyAndPrevent("PageDown", [cmdKey], () => {
          animateWithDelta(MAX_POSITION);
        }):
          return;
        case handleKeyAndPrevent("PageUp", [cmdKey], () => {
          animateWithDelta(0n);
        }):
          return;
        case handleKeyAndPrevent("PageDown", [], () => {
          animateWithDelta(PAGE_SIZE);
        }):
          return;
        case handleKeyAndPrevent("PageUp", [], () => {
          animateWithDelta(-PAGE_SIZE);
        }):
          return;
        case handleKeyAndPrevent("Home", [], () => animateWithDelta(0n)):
          return;
        case handleKeyAndPrevent("End", [], () =>
          animateWithDelta(MAX_POSITION)
        ):
          return;
        case handleKeyAndPrevent("ArrowDown", [], () => movePosition(1n)):
          return;
        case handleKeyAndPrevent("ArrowUp", [], () => movePosition(-1n)):
          return;
        case handleKeyAndPrevent("j", [], () => movePosition(1n)):
          return;
        case handleKeyAndPrevent("k", [], () => movePosition(-1n)):
          return;
        default:
          break;
      }
    },
    [
      isAnimating,
      virtualPosition,
      movePosition,
      MAX_POSITION,
      itemsToShow,
      animateToPosition,
    ]
  );

  return (
    <Wrapper ref={ref} onKeyDown={handleKeyDown} tabIndex={0}>
      <List key={randomized ? "rand" : "seq"}>
        <TopControls>
          <label style={{ color: "black", fontFamily: "monospace", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={randomized}
              onChange={(e) => setRandomized(e.target.checked)}
              style={{ marginRight: "0.25rem" }}
            />
            aleatório
          </label>
        </TopControls>
        {displayedUUIDs.map(({ index, uuid }, i) => {
          return (
            <Row
              key={uuid}
              index={index}
              uuid={uuid}
              isFaved={favedUUIDs[uuid]}
              toggleFavedUUID={toggleFavedUUID}
              search={search}
              searchDisplayed={searchDisplayed}
            />
          );
        })}
      </List>
    </Wrapper>
  );
}

export default UUIDDisplay;
