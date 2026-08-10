/** Data model of the vector switchboard schematic (Visio-like editor). */

export type WireKind = "L1" | "L2" | "L3" | "N" | "PE" | "CTRL";

export type ElKind =
  | "input"
  | "breaker"
  | "rcd"
  | "control"
  | "bus"
  | "terminal"
  | "load";

export type SchElement = {
  id: string;
  type: string;
  ref: string;
  name: string;
  manufacturer: string;
  model: string;
  rating: string;
  poles: number;
  modules: number;
  phase: string;
  line: string;
  cable: string;
  x: number;
  y: number;
  w: number;
  h: number;
  group: string;
};

export type EndPoint = { el: string; port: string };

export type SchWire = {
  id: string;
  from: EndPoint;
  to: EndPoint;
  kind: WireKind;
  color: string;
};

export type PageFormat = "A4" | "A3" | "A2" | "A1";

export type SchDoc = {
  elements: SchElement[];
  wires: SchWire[];
  mode: "single" | "multi";
  page: { format: PageFormat; landscape: boolean };
  grid: { size: number; show: boolean; snap: boolean };
  show: { rating: boolean; cable: boolean; name: boolean };
  colors: Record<WireKind, string>;
  title: { object: string; name: string; date: string; author: string; sheet: string };
};

export type Port = {
  id: string;
  kind: "in" | "out";
  wire: WireKind;
  x: number;
  y: number;
  label: string;
};
