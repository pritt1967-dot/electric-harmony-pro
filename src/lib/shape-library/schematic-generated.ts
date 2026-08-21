/** АВТОГЕНЕРАЦИЯ — БИБЛИОТЕКА №1 (УГО однолинейной схемы).
 *  Источник: electricaldiagramTimVisio.vss — ВСЕ мастера VSS.
 *  Точки подключения и пользовательские свойства для фигур, встречающихся
 *  в эталоне «Документ1.vsdx», взяты из его мастеров (source: "visio-master").
 *  Скрипт: scripts/visio/build_schematic_library.py. Не редактировать вручную. */

export type SchematicConnPoint = {
  id: string;
  x_mm: number;
  y_mm: number;
  /** visio-master — точные данные Visio; geometry — вычислено по концам контуров VSS. */
  source: "visio-master" | "geometry";
};

export type SchematicProp = { key: string; label: string; value: string };

export type SchematicSymbol = {
  /** внутренний ID библиотеки */
  id: string;
  name: string;
  category: string;
  /** Master ID из Visio (из Документ1.vsdx, если фигура там используется) */
  master_id: string | null;
  /** BaseID / UniqueID мастера Visio */
  base_id: string | null;
  /** порядковый Shape ID мастера внутри VSS */
  shape_id: number;
  source_vss: string;
  source_master: string;
  width_mm: number;
  height_mm: number;
  aspect_ratio: number;
  bbox_mm: { w: number; h: number };
  paths: number;
  texts: string[];
  props: SchematicProp[];
  connection_points: SchematicConnPoint[];
  conn_source: "visio-master" | "geometry" | "none";
  svg: string;
  errors: string[];
};

export const SCHEMATIC_SYMBOLS: SchematicSymbol[] = [
  {
    "id": "line-l-n-pe",
    "name": "Line L, N, PE",
    "category": "bus",
    "master_id": "6",
    "base_id": "{91EA3A5A-DEA2-46C9-80C9-03F14FE3EAC0}",
    "shape_id": 1,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Line L, N, PE (VSS master #1)",
    "width_mm": 10.0,
    "height_mm": 10.0,
    "aspect_ratio": 1.0,
    "bbox_mm": {
      "w": 15.75,
      "h": 10.0
    },
    "paths": 3,
    "texts": [
      "L",
      "PE",
      "N"
    ],
    "props": [
      {
        "key": "lineLText",
        "label": "L",
        "value": "L"
      },
      {
        "key": "lineNText",
        "label": "N",
        "value": "N"
      },
      {
        "key": "linePEText",
        "label": "PE",
        "value": "PE"
      }
    ],
    "connection_points": [
      {
        "id": "0",
        "x_mm": 10.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "1",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "2",
        "x_mm": 10.0,
        "y_mm": 5.0,
        "source": "visio-master"
      },
      {
        "id": "3",
        "x_mm": 0.0,
        "y_mm": 5.0,
        "source": "visio-master"
      },
      {
        "id": "4",
        "x_mm": 10.0,
        "y_mm": 10.0,
        "source": "visio-master"
      },
      {
        "id": "5",
        "x_mm": 0.0,
        "y_mm": 10.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-18.313 -2.000 48.660 32.346\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1000\" >\n<path d=\" \nM0.0000,0.0000\nL28.3465,0.0000\" \nstyle=\"stroke-width: 1.5000; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-10.4685\" y=\"0.0000\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nL</tspan>\n</text>\n</g>\n<g id=\"Layer1001\" >\n<path d=\" \nM0.0000,28.3465\nL28.3465,28.3465\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-16.3132\" y=\"28.3465\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nPE</tspan>\n</text>\n</g>\n<g id=\"Layer1002\" >\n<path d=\" \nM0.0000,14.1732\nL28.3465,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-12.7193\" y=\"14.1732\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nN</tspan>\n</text>\n</g></svg>",
    "errors": []
  },
  {
    "id": "line-l",
    "name": "Line L",
    "category": "bus",
    "master_id": null,
    "base_id": null,
    "shape_id": 2,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Line L (VSS master #2)",
    "width_mm": 10.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.394,
    "bbox_mm": {
      "w": 13.69,
      "h": 0.0
    },
    "paths": 1,
    "texts": [
      "L"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.4,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 10.0,
        "y_mm": 12.4,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-12.469 33.150 42.815 4.500\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><path d=\" \nM0.0000,35.1496\nL28.3465,35.1496\" \nstyle=\"stroke-width: 1.5000; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-10.4685\" y=\"35.1496\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nL</tspan>\n</text></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "line-n",
    "name": "Line N",
    "category": "bus",
    "master_id": null,
    "base_id": null,
    "shape_id": 3,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Line N (VSS master #3)",
    "width_mm": 10.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.394,
    "bbox_mm": {
      "w": 14.49,
      "h": 0.0
    },
    "paths": 1,
    "texts": [
      "N"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.4,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 10.0,
        "y_mm": 12.4,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-14.719 33.150 45.066 4.500\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><path d=\" \nM0.0000,35.1496\nL28.3465,35.1496\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-12.7193\" y=\"35.1496\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nN</tspan>\n</text></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "line-pe",
    "name": "Line PE",
    "category": "bus",
    "master_id": null,
    "base_id": null,
    "shape_id": 4,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Line PE (VSS master #4)",
    "width_mm": 10.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.394,
    "bbox_mm": {
      "w": 15.75,
      "h": 0.0
    },
    "paths": 1,
    "texts": [
      "PE"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.4,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 10.0,
        "y_mm": 12.4,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-18.313 33.150 48.660 4.500\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><path d=\" \nM0.0000,35.1496\nL28.3465,35.1496\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-16.3132\" y=\"35.1496\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nPE</tspan>\n</text></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "point",
    "name": "Point",
    "category": "bus",
    "master_id": "17",
    "base_id": "{B9B133B8-0289-4477-A634-83DD12ADE3C5}",
    "shape_id": 5,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Point (VSS master #5)",
    "width_mm": 1.5,
    "height_mm": 1.5,
    "aspect_ratio": 1.0,
    "bbox_mm": {
      "w": 1.15,
      "h": 3.37
    },
    "paths": 2,
    "texts": [],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": ""
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": ""
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "Point",
        "x_mm": 0.75,
        "y_mm": 0.75,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-1.006 -9.419 7.258 13.545\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1003\" >\n<g id=\"Layer1004\" >\n<path d=\" \nM4.2520,2.1260\nA2.1260,2.1260 180.0000 1,1 2.1260,0.0000\nA2.1260,2.1260 180.0000 0,1 4.2520,2.1260\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM4.2520,2.1260\nA2.1260,2.1260 180.0000 1,1 2.1260,0.0000\nA2.1260,2.1260 180.0000 0,1 4.2520,2.1260\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"0.9938\" y=\"-7.4191\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "line",
    "name": "Line",
    "category": "bus",
    "master_id": null,
    "base_id": null,
    "shape_id": 6,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Line (VSS master #6)",
    "width_mm": 2.12,
    "height_mm": 2.12,
    "aspect_ratio": 1.0,
    "bbox_mm": {
      "w": 4.6,
      "h": 2.12
    },
    "paths": 1,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 2.12,
        "y_mm": 0.06,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 0.0,
        "y_mm": 2.18,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-9.032 -1.828 17.045 10.013\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><path d=\" \nM6.0132,0.1720\nL0.0000,6.1852\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-7.0316\" y=\"3.1785\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "n",
    "name": "N",
    "category": "bus",
    "master_id": "18",
    "base_id": "{63ED7B7F-DB35-4288-86FA-D9DB15CD3F26}",
    "shape_id": 7,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "N (VSS master #7)",
    "width_mm": 1.0,
    "height_mm": 1.0,
    "aspect_ratio": 1.0,
    "bbox_mm": {
      "w": 5.21,
      "h": 2.62
    },
    "paths": 2,
    "texts": [],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": ""
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": ""
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "0",
        "x_mm": 0.5,
        "y_mm": 0.5,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-9.508 -5.007 18.767 11.431\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1005\" >\n<path d=\" \nM7.2586,-3.0066\nA1.4173,1.4173 180.0000 0,1 5.8412,-1.5893\nA1.4173,1.4173 180.0000 1,1 7.2586,-3.0066\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM7.2586,-3.0066\nA1.4173,1.4173 180.0000 0,1 5.8412,-1.5893\nA1.4173,1.4173 180.0000 1,1 7.2586,-3.0066\nZ\nM4.6243,-1.7897\nL-1.5893,4.4239\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"-7.5084\" y=\"1.4173\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text></svg>",
    "errors": [
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "pen",
    "name": "PEN",
    "category": "bus",
    "master_id": "19",
    "base_id": "{2277A54E-F5F3-4DC3-A49C-60EF241F0BCC}",
    "shape_id": 8,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "PEN (VSS master #8)",
    "width_mm": 1.0,
    "height_mm": 1.0,
    "aspect_ratio": 1.0,
    "bbox_mm": {
      "w": 6.9,
      "h": 5.81
    },
    "paths": 2,
    "texts": [],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": ""
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": ""
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "0",
        "x_mm": 0.5,
        "y_mm": 0.5,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-9.508 -14.055 23.563 20.479\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1006\" >\n<path d=\" \nM6.8433,-4.0089\nA1.4173,1.4173 58.2825 1,1 4.8389,-2.0045\nA1.4173,1.4173 0.0000 0,1 6.8433,-4.0089\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM12.0546,-6.3856\nL12.0546,-12.0549\nM6.8433,-4.0089\nA1.4173,1.4173 58.2825 1,1 4.8389,-2.0045\nA1.4173,1.4173 0.0000 0,1 6.8433,-4.0089\nZ\nM6.8433,-4.0089\nL12.0395,-9.2051\nM4.8389,-2.0045\nL4.6241,-1.7897\nM4.6242,-1.7897\nL-1.5894,4.4239\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"-7.5084\" y=\"1.4173\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text></svg>",
    "errors": [
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "ugo",
    "name": "UGO",
    "category": "bus",
    "master_id": null,
    "base_id": null,
    "shape_id": 9,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "UGO (VSS master #9)",
    "width_mm": 50.0,
    "height_mm": 50.0,
    "aspect_ratio": 1.0,
    "bbox_mm": {
      "w": 50.0,
      "h": 55.0
    },
    "paths": 2,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 50.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 -2.000 145.732 159.905\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1007\" >\n<path d=\" \nM0.0000,141.7323\nL141.7323,141.7323\nL141.7323,0.0000\nL0.0000,0.0000\nL0.0000,141.7323\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM0.0000,141.7323\nL141.7323,141.7323\nL141.7323,0.0000\nL0.0000,0.0000\nL0.0000,141.7323\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"69.7340\" y=\"70.8661\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"69.5079\" y=\"155.9055\">\n<tspan font-family=\"Calibri\" font-size=\"12.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "pe-line",
    "name": "PE Line",
    "category": "bus",
    "master_id": null,
    "base_id": null,
    "shape_id": 10,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "PE Line (VSS master #10)",
    "width_mm": 1.0,
    "height_mm": 1.0,
    "aspect_ratio": 1.0,
    "bbox_mm": {
      "w": 4.71,
      "h": 3.62
    },
    "paths": 1,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 2.06,
        "y_mm": -2.06,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": -0.56,
        "y_mm": 1.56,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-9.508 -7.841 17.349 14.265\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><path d=\" \nM5.8411,-5.8413\nL5.8411,-0.1720\nM5.8260,-2.9915\nL-1.5894,4.4239\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-7.5084\" y=\"1.4173\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "qf-cable",
    "name": "QF cable",
    "category": "breaker",
    "master_id": "5",
    "base_id": "{2259D235-38E9-4C83-83AF-26B7FD4B69F8}",
    "shape_id": 11,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QF cable (VSS master #11)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.61,
      "h": 75.0
    },
    "paths": 8,
    "texts": [
      "ВВГнг(А)-LS",
      "QF"
    ],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": "QF"
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": "QF"
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      },
      {
        "key": "Mark",
        "label": "Марка",
        "value": ""
      },
      {
        "key": "Name",
        "label": "Наименование",
        "value": "0"
      },
      {
        "key": "Article",
        "label": "Артикул",
        "value": "0"
      },
      {
        "key": "Nominal",
        "label": "Номинал",
        "value": ""
      },
      {
        "key": "Polus",
        "label": "Количество полюсов",
        "value": "1"
      },
      {
        "key": "CableText",
        "label": "Кабель",
        "value": "ВВГнг(А)-LS"
      }
    ],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 75.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "in_1",
        "x_mm": 40.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out_1",
        "x_mm": 55.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "N",
        "x_mm": 70.0,
        "y_mm": -5.0,
        "source": "visio-master"
      },
      {
        "id": "PE",
        "x_mm": 65.0,
        "y_mm": -10.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-5.673 -2.000 68.096 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1008\" >\n<path d=\" \nM32.0763,212.5999\nL32.0763,85.0394\nM32.0763,0.0000\nL32.0763,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1009\" >\n<path d=\" \nM27.3099,75.4115\nL24.5146,76.7931\nL27.0264,81.8755\nL29.8217,80.4940\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM32.0763,85.0557\nL25.0554,70.8499\nM27.3099,75.4115\nL24.5146,76.7931\nL27.0264,81.8755\nL29.8217,80.4940\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<defs>\n<marker id=\"startMarker1\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM60.4227,28.3465\nL60.4227,99.2126\nL32.0763,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker1); \"/>\n<defs>\n<marker id=\"startMarker2\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM46.2495,14.1732\nL46.2495,99.2126\nL32.0763,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker2); \"/>\n<path d=\" \nM29.0697,53.9443\nL35.0828,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-3.6731\" y=\"162.9921\" transform=\"rotate(-90.0000, 21.3046, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1010\" >\n<path d=\" \nM34.2022,0.0000\nA2.1260,2.1260 180.0000 1,1 32.0763,-2.1260\nA2.1260,2.1260 180.0000 0,1 34.2022,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM34.2022,0.0000\nA2.1260,2.1260 180.0000 1,1 32.0763,-2.1260\nA2.1260,2.1260 180.0000 0,1 34.2022,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"5.7327\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQF</tspan>\n</text>\n</g></svg>",
    "errors": []
  },
  {
    "id": "qf-n-cable",
    "name": "QF+N cable",
    "category": "breaker",
    "master_id": null,
    "base_id": null,
    "shape_id": 12,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QF+N cable (VSS master #12)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.61,
      "h": 75.0
    },
    "paths": 9,
    "texts": [
      "ВВГнг(А)-LS",
      "QF"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 11.0,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 11.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 21.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 11.0,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 9.94,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 12.06,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 16.0,
        "y_mm": 30.0,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 16.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 14.45,
        "y_mm": 27.0,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 10.21,
        "y_mm": 28.39,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-6.568 -2.000 68.096 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1011\" >\n<path d=\" \nM31.1811,212.5999\nL31.1811,85.0394\nM31.1811,0.0000\nL31.1811,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker3\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM59.5276,28.3465\nL59.5276,99.2126\nL31.1811,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker3); \"/>\n<path d=\" \nM28.1745,53.9443\nL34.1876,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-4.5683\" y=\"162.9921\" transform=\"rotate(-90.0000, 20.4094, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1012\" >\n<path d=\" \nM33.3071,0.0000\nA2.1260,2.1260 180.0000 1,1 31.1811,-2.1260\nA2.1260,2.1260 180.0000 0,1 33.3071,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM33.3071,0.0000\nA2.1260,2.1260 180.0000 1,1 31.1811,-2.1260\nA2.1260,2.1260 180.0000 0,1 33.3071,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1013\" >\n<path d=\" \nM47.4803,14.1732\nA2.1260,2.1260 180.0000 1,1 45.3543,12.0472\nA2.1260,2.1260 180.0000 0,1 47.4803,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM47.4803,14.1732\nA2.1260,2.1260 180.0000 1,1 45.3543,12.0472\nA2.1260,2.1260 180.0000 0,1 47.4803,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM45.3543,85.0394\nL45.3543,99.2126\nL31.1811,113.3858\nM45.3543,14.1732\nL45.3543,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM40.9606,76.5354\nL27.0709,76.5354\nM42.5196,79.3701\nL28.4882,79.3701\nM38.2677,70.8336\nL45.3543,85.0067\nM31.1811,85.0394\nL24.1602,70.8336\nM26.4147,75.3952\nL23.6194,76.7768\nL26.1313,81.8592\nL28.9266,80.4777\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"4.8376\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQF</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qfd-cable",
    "name": "QFD cable",
    "category": "rcbo",
    "master_id": "9",
    "base_id": "{DD07DA7B-F0F0-443D-952C-823311F0AA13}",
    "shape_id": 13,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QFD cable (VSS master #13)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.96,
      "h": 75.0
    },
    "paths": 8,
    "texts": [
      "ВВГнг(А)-LS",
      "QFD"
    ],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": "QFD"
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": "QFD"
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      },
      {
        "key": "Mark",
        "label": "Марка",
        "value": ""
      },
      {
        "key": "Name",
        "label": "Наименование",
        "value": "0"
      },
      {
        "key": "Article",
        "label": "Артикул",
        "value": "0"
      },
      {
        "key": "Nominal",
        "label": "Номинал",
        "value": ""
      },
      {
        "key": "Polus",
        "label": "Количество полюсов",
        "value": "1"
      },
      {
        "key": "CableText",
        "label": "Кабель",
        "value": "ВВГнг(А)-LS"
      },
      {
        "key": "Leakage",
        "label": "Дифф. ток",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 75.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "in_1",
        "x_mm": 40.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out_1",
        "x_mm": 55.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "N",
        "x_mm": 70.0,
        "y_mm": -5.0,
        "source": "visio-master"
      },
      {
        "id": "PE",
        "x_mm": 65.0,
        "y_mm": -10.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-3.315 -2.000 69.094 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1014\" >\n<path d=\" \nM35.4331,212.5999\nL35.4331,85.0394\nM35.4331,0.0000\nL35.4331,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker4\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM63.7795,28.3465\nL63.7795,99.2126\nL35.4331,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker4); \"/>\n<defs>\n<marker id=\"startMarker5\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM49.6063,14.1732\nL49.6063,56.6929\nL35.4331,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker5); \"/>\n<path d=\" \nM32.4265,53.9443\nL38.4396,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-0.3163\" y=\"162.9921\" transform=\"rotate(-90.0000, 24.6614, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1015\" >\n<path d=\" \nM37.5591,0.0000\nA2.1260,2.1260 180.0000 1,1 35.4331,-2.1260\nA2.1260,2.1260 180.0000 0,1 37.5591,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM37.5591,0.0000\nA2.1260,2.1260 180.0000 1,1 35.4331,-2.1260\nA2.1260,2.1260 180.0000 0,1 37.5591,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1016\" >\n<path d=\" \nM33.1782,80.4765\nL30.3828,81.8580\nL27.8709,76.7756\nL30.6663,75.3940\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM43.9366,92.1248\nA8.5039,3.5433 180.0000 1,1 35.4327,88.5815\nA8.5039,3.5433 180.0000 0,1 43.9366,92.1248\nZ\nM26.9288,92.1248\nL21.2606,92.1248\nL21.2606,79.3684\nL29.1960,79.3684\nM33.1782,80.4765\nL30.3828,81.8580\nL27.8709,76.7756\nL30.6663,75.3940\nM28.4118,70.8323\nL35.4327,85.0382\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"-1.3148\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQFD</tspan>\n</text>\n</g></svg>",
    "errors": []
  },
  {
    "id": "qfd-n-cable",
    "name": "QFD+N cable",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 14,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QFD+N cable (VSS master #14)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.96,
      "h": 75.0
    },
    "paths": 9,
    "texts": [
      "ВВГнг(А)-LS",
      "QFD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 22.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 12.0,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 10.94,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 13.06,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 17.0,
        "y_mm": 30.0,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 17.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 16.0,
        "y_mm": 28.0,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 9.49,
        "y_mm": 32.5,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4.732 -2.000 69.094 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1017\" >\n<path d=\" \nM34.0157,212.5999\nL34.0157,85.0394\nM34.0157,0.0000\nL34.0157,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker6\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM62.3622,28.3465\nL62.3622,99.2126\nL34.0157,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker6); \"/>\n<path d=\" \nM31.0092,53.9443\nL37.0223,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-1.7336\" y=\"162.9921\" transform=\"rotate(-90.0000, 23.2441, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1018\" >\n<path d=\" \nM36.1417,0.0000\nA2.1260,2.1260 180.0000 1,1 34.0157,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.1417,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM36.1417,0.0000\nA2.1260,2.1260 180.0000 1,1 34.0157,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.1417,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1019\" >\n<path d=\" \nM50.3150,14.1732\nA2.1260,2.1260 180.0000 1,1 48.1890,12.0472\nA2.1260,2.1260 180.0000 0,1 50.3150,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM50.3150,14.1732\nA2.1260,2.1260 180.0000 1,1 48.1890,12.0472\nA2.1260,2.1260 180.0000 0,1 50.3150,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM48.1890,85.0394\nL48.1890,99.2126\nL34.0157,113.3858\nM48.1890,14.1732\nL48.1890,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM45.3543,79.3849\nL31.3228,79.3849\nM43.7953,76.5503\nL29.9055,76.5503\nM55.2756,92.1408\nA14.1404,3.5433 180.0000 0,1 41.1352,95.6841\nA14.1404,3.5433 180.0000 1,1 55.2756,92.1408\nZ\nM41.1024,70.8484\nL48.1890,85.0216\nM34.0157,85.0543\nL26.9948,70.8484\nM29.2493,75.4101\nL26.4540,76.7916\nL28.9659,81.8741\nL31.7612,80.4925\nM27.7087,79.3844\nL19.8425,79.3844\nL19.8425,92.1408\nL26.8926,92.1408\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-2.7321\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQFD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qd-cable",
    "name": "QD cable",
    "category": "rcd",
    "master_id": "12",
    "base_id": "{67E5B0C2-0426-43F8-93E6-093BD4F4E608}",
    "shape_id": 15,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QD cable (VSS master #15)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.61,
      "h": 75.0
    },
    "paths": 7,
    "texts": [
      "ВВГнг(А)-LS",
      "QD"
    ],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": "QD"
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": "QD"
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      },
      {
        "key": "Mark",
        "label": "Марка",
        "value": ""
      },
      {
        "key": "Name",
        "label": "Наименование",
        "value": "0"
      },
      {
        "key": "Article",
        "label": "Артикул",
        "value": "0"
      },
      {
        "key": "Nominal",
        "label": "Номинал",
        "value": ""
      },
      {
        "key": "Polus",
        "label": "Количество полюсов",
        "value": "1"
      },
      {
        "key": "CableText",
        "label": "Кабель",
        "value": "ВВГнг(А)-LS"
      },
      {
        "key": "Leakage",
        "label": "Дифф. ток",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 75.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "in_1",
        "x_mm": 40.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out_1",
        "x_mm": 55.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "N",
        "x_mm": 70.0,
        "y_mm": -5.0,
        "source": "visio-master"
      },
      {
        "id": "PE",
        "x_mm": 65.0,
        "y_mm": -10.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-6.568 -2.000 68.096 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1020\" >\n<path d=\" \nM31.1811,212.5999\nL31.1811,85.0394\nM31.1811,0.0000\nL31.1811,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker7\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM59.5276,28.3465\nL59.5276,99.2126\nL31.1811,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker7); \"/>\n<defs>\n<marker id=\"startMarker8\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM45.3543,14.1732\nL45.3543,56.6929\nL31.1811,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker8); \"/>\n<path d=\" \nM28.1745,53.9443\nL34.1876,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-4.5683\" y=\"162.9921\" transform=\"rotate(-90.0000, 20.4094, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1021\" >\n<path d=\" \nM33.3071,0.0000\nA2.1260,2.1260 180.0000 1,1 31.1811,-2.1260\nA2.1260,2.1260 180.0000 0,1 33.3071,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM33.3071,0.0000\nA2.1260,2.1260 180.0000 1,1 31.1811,-2.1260\nA2.1260,2.1260 180.0000 0,1 33.3071,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM39.6846,92.1248\nA8.5039,3.5433 180.0000 1,1 31.1807,88.5815\nA8.5039,3.5433 180.0000 0,1 39.6846,92.1248\nZ\nM22.6768,92.1248\nL17.0086,92.1248\nL17.0086,78.0347\nL27.6663,78.0347\nM24.1598,70.8323\nL31.1807,85.0382\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-0.9720\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQD</tspan>\n</text>\n</g></svg>",
    "errors": []
  },
  {
    "id": "qd-n-cable",
    "name": "QD+N cable",
    "category": "rcd",
    "master_id": null,
    "base_id": null,
    "shape_id": 16,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QD+N cable (VSS master #16)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.61,
      "h": 75.0
    },
    "paths": 9,
    "texts": [
      "ВВГнг(А)-LS",
      "QD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 10.0,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 10.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 20.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 10.0,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 8.94,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 11.06,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 15.0,
        "y_mm": 30.0,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 15.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 14.0,
        "y_mm": 28.0,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 7.49,
        "y_mm": 32.5,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-9.403 -2.000 68.096 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1022\" >\n<path d=\" \nM28.3465,212.5999\nL28.3465,85.0394\nM28.3465,0.0000\nL28.3465,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker9\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM56.6929,28.3465\nL56.6929,99.2126\nL28.3465,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker9); \"/>\n<path d=\" \nM25.3399,53.9443\nL31.3530,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-7.4029\" y=\"162.9921\" transform=\"rotate(-90.0000, 17.5748, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1023\" >\n<path d=\" \nM30.4724,0.0000\nA2.1260,2.1260 180.0000 1,1 28.3465,-2.1260\nA2.1260,2.1260 180.0000 0,1 30.4724,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM30.4724,0.0000\nA2.1260,2.1260 180.0000 1,1 28.3465,-2.1260\nA2.1260,2.1260 180.0000 0,1 30.4724,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1024\" >\n<path d=\" \nM44.6457,14.1732\nA2.1260,2.1260 180.0000 1,1 42.5197,12.0472\nA2.1260,2.1260 180.0000 0,1 44.6457,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM44.6457,14.1732\nA2.1260,2.1260 180.0000 1,1 42.5197,12.0472\nA2.1260,2.1260 180.0000 0,1 44.6457,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM42.5197,85.0394\nL42.5197,99.2126\nL28.3465,113.3858\nM42.5197,14.1732\nL42.5197,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM39.6850,79.3849\nL25.6535,79.3849\nM38.1260,76.5503\nL24.2362,76.5503\nM49.6063,92.1408\nA14.1404,3.5433 180.0000 0,1 35.4659,95.6841\nA14.1404,3.5433 180.0000 1,1 49.6063,92.1408\nZ\nM35.4331,70.8484\nL42.5197,85.0216\nM28.3465,85.0543\nL21.3255,70.8484\nM24.8031,78.0508\nL14.1732,78.0508\nL14.1732,92.1408\nL21.2233,92.1408\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-3.8067\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qs-cable",
    "name": "QS cable",
    "category": "switch",
    "master_id": "13",
    "base_id": "{585AF47C-79F2-4F6F-BFED-5A96968DA858}",
    "shape_id": 17,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QS cable (VSS master #17)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.61,
      "h": 75.0
    },
    "paths": 7,
    "texts": [
      "ВВГнг(А)-LS",
      "QS"
    ],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": "QS"
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": "QS"
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      },
      {
        "key": "Mark",
        "label": "Марка",
        "value": ""
      },
      {
        "key": "Name",
        "label": "Наименование",
        "value": "0"
      },
      {
        "key": "Article",
        "label": "Артикул",
        "value": "0"
      },
      {
        "key": "Nominal",
        "label": "Номинал",
        "value": ""
      },
      {
        "key": "Polus",
        "label": "Количество полюсов",
        "value": "1"
      },
      {
        "key": "CableText",
        "label": "Кабель",
        "value": "ВВГнг(А)-LS"
      }
    ],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 75.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "in_1",
        "x_mm": 40.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out_1",
        "x_mm": 55.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "N",
        "x_mm": 70.0,
        "y_mm": -5.0,
        "source": "visio-master"
      },
      {
        "id": "PE",
        "x_mm": 65.0,
        "y_mm": -10.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-3.734 -2.000 68.096 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1025\" >\n<path d=\" \nM34.0157,212.5999\nL34.0157,85.0394\nM34.0157,0.0000\nL34.0157,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker10\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM62.3622,28.3465\nL62.3622,99.2126\nL34.0157,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker10); \"/>\n<defs>\n<marker id=\"startMarker11\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM48.1890,14.1732\nL48.1890,99.2126\nL34.0157,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker11); \"/>\n<path d=\" \nM31.0092,53.9443\nL37.0223,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-1.7336\" y=\"162.9921\" transform=\"rotate(-90.0000, 23.2441, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1026\" >\n<path d=\" \nM36.1417,0.0000\nA2.1260,2.1260 180.0000 1,1 34.0157,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.1417,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM36.1417,0.0000\nA2.1260,2.1260 180.0000 1,1 34.0157,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.1417,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM34.0157,85.0557\nL26.9949,70.8499\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"7.6722\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQS</tspan>\n</text>\n</g></svg>",
    "errors": []
  },
  {
    "id": "qs-n-cable",
    "name": "QS+N cable",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 18,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QS+N cable (VSS master #18)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.61,
      "h": 75.0
    },
    "paths": 9,
    "texts": [
      "ВВГнг(А)-LS",
      "QS"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 11.32,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 11.32,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 21.31,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 11.32,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 10.26,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 12.38,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 16.32,
        "y_mm": 30.0,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 16.32,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 15.31,
        "y_mm": 28.0,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 8.84,
        "y_mm": 24.99,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-5.673 -2.000 68.096 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1027\" >\n<path d=\" \nM32.0763,212.5999\nL32.0763,85.0394\nM32.0763,0.0000\nL32.0763,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker12\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM60.4227,28.3465\nL60.4227,99.2126\nL32.0763,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker12); \"/>\n<path d=\" \nM29.0697,53.9443\nL35.0828,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-3.6731\" y=\"162.9921\" transform=\"rotate(-90.0000, 21.3046, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1028\" >\n<path d=\" \nM34.2022,0.0000\nA2.1260,2.1260 180.0000 1,1 32.0763,-2.1260\nA2.1260,2.1260 180.0000 0,1 34.2022,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM34.2022,0.0000\nA2.1260,2.1260 180.0000 1,1 32.0763,-2.1260\nA2.1260,2.1260 180.0000 0,1 34.2022,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1029\" >\n<path d=\" \nM48.3755,14.1732\nA2.1260,2.1260 180.0000 1,1 46.2495,12.0472\nA2.1260,2.1260 180.0000 0,1 48.3755,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM48.3755,14.1732\nA2.1260,2.1260 180.0000 1,1 46.2495,12.0472\nA2.1260,2.1260 180.0000 0,1 48.3755,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM46.2495,85.0394\nL46.2495,99.2126\nL32.0763,113.3858\nM46.2495,14.1732\nL46.2495,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM43.4148,79.3849\nL29.3833,79.3849\nM41.8558,76.5503\nL27.9660,76.5503\nM39.1629,70.8484\nL46.2495,85.0216\nM32.0763,85.0543\nL25.0553,70.8484\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"5.7327\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQS</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qsa-cable",
    "name": "QSA cable",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 19,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QSA cable (VSS master #19)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.83,
      "h": 75.0
    },
    "paths": 8,
    "texts": [
      "ВВГнг(А)-LS",
      "AFD",
      "QSA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.5,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.5,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 22.5,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 12.5,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 17.5,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 11.44,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 13.56,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 9.5,
        "y_mm": 33.75,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 12.5,
        "y_mm": 30.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.949 -2.000 68.728 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1030\" >\n<path d=\" \nM35.4331,212.5999\nL35.4331,85.0394\nM35.4331,0.0000\nL35.4331,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker13\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM63.7795,28.3465\nL63.7795,99.2126\nL35.4331,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker13); \"/>\n<defs>\n<marker id=\"startMarker14\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM49.6063,14.1732\nL49.6063,56.6944\nL35.4331,70.8676\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker14); \"/>\n<path d=\" \nM32.4265,53.9443\nL38.4396,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-0.3163\" y=\"162.9921\" transform=\"rotate(-90.0000, 24.6614, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1031\" >\n<path d=\" \nM37.5591,0.0000\nA2.1260,2.1260 180.0000 1,1 35.4331,-2.1260\nA2.1260,2.1260 180.0000 0,1 37.5591,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM37.5591,0.0000\nA2.1260,2.1260 180.0000 1,1 35.4331,-2.1260\nA2.1260,2.1260 180.0000 0,1 37.5591,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1032\" >\n<path d=\" \nM26.9288,95.6681\nL26.9288,88.5815\nL43.9366,88.5815\nL43.9366,95.6681\nL26.9288,95.6681\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM35.4327,85.0382\nL28.4117,70.8324\nM31.7467,77.9516\nL21.2606,77.9516\nL21.2606,92.1248\nL26.9288,92.1248\nM26.9288,95.6681\nL26.9288,88.5815\nL43.9366,88.5815\nL43.9366,95.6681\nL26.9288,95.6681\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"29.7931\" y=\"92.1260\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"-0.9487\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQSA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qsa-n-cable",
    "name": "QSA+N cable",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 20,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QSA+N cable (VSS master #20)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.83,
      "h": 75.0
    },
    "paths": 10,
    "texts": [
      "ВВГнг(А)-LS",
      "AFD",
      "QSA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 13.0,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 13.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 23.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 13.0,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 11.94,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 14.06,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 18.0,
        "y_mm": 31.25,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 10.52,
        "y_mm": 33.75,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 13.0,
        "y_mm": 30.0,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 10.4,
        "y_mm": 32.5,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-1.531 -2.000 68.728 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1033\" >\n<path d=\" \nM36.8504,212.5999\nL36.8504,85.0394\nM36.8504,0.0000\nL36.8504,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker15\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM65.1969,28.3465\nL65.1969,99.2126\nL36.8504,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker15); \"/>\n<path d=\" \nM33.8438,53.9443\nL39.8569,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"1.1010\" y=\"162.9921\" transform=\"rotate(-90.0000, 26.0787, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1034\" >\n<path d=\" \nM38.9764,0.0000\nA2.1260,2.1260 180.0000 1,1 36.8504,-2.1260\nA2.1260,2.1260 180.0000 0,1 38.9764,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM38.9764,0.0000\nA2.1260,2.1260 180.0000 1,1 36.8504,-2.1260\nA2.1260,2.1260 180.0000 0,1 38.9764,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1035\" >\n<path d=\" \nM53.1496,14.1732\nA2.1260,2.1260 180.0000 1,1 51.0236,12.0472\nA2.1260,2.1260 180.0000 0,1 53.1496,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM53.1496,14.1732\nA2.1260,2.1260 180.0000 1,1 51.0236,12.0472\nA2.1260,2.1260 180.0000 0,1 53.1496,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM51.0236,88.5827\nL51.0236,99.2126\nL36.8504,113.3858\nM51.0236,14.1732\nL51.0236,88.5827\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1036\" >\n<path d=\" \nM29.8295,95.6830\nL29.8295,88.5964\nL58.1102,88.5964\nL58.1102,95.6830\nL29.8295,95.6830\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM36.8504,85.0531\nL29.8294,70.8473\nM29.8295,95.6830\nL29.8295,88.5964\nL58.1102,88.5964\nL58.1102,95.6830\nL29.8295,95.6830\nZ\nM33.0480,77.9338\nL22.6772,77.9338\nL22.6772,92.1397\nL29.4718,92.1397\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"38.2970\" y=\"92.1260\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"0.4686\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQSA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qfa-cable",
    "name": "QFA cable",
    "category": "breaker",
    "master_id": null,
    "base_id": null,
    "shape_id": 21,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QFA cable (VSS master #21)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.83,
      "h": 75.0
    },
    "paths": 8,
    "texts": [
      "ВВГнг(А)-LS",
      "AFD",
      "QFA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.16,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.16,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 22.16,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 12.16,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 17.16,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 11.1,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 13.22,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 12.17,
        "y_mm": 31.28,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 10.48,
        "y_mm": 26.63,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 9.16,
        "y_mm": 32.53,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-3.906 -2.000 68.728 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1037\" >\n<path d=\" \nM34.4754,212.5999\nL34.4754,85.0394\nM34.4754,0.0000\nL34.4754,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker16\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM62.8219,28.3465\nL62.8219,99.2126\nL34.4754,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker16); \"/>\n<defs>\n<marker id=\"startMarker17\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM48.6486,14.1732\nL48.6486,56.6929\nL34.4754,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker17); \"/>\n<path d=\" \nM31.4689,53.9443\nL37.4819,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-1.2739\" y=\"162.9921\" transform=\"rotate(-90.0000, 23.7038, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1038\" >\n<path d=\" \nM36.6014,0.0000\nA2.1260,2.1260 180.0000 1,1 34.4754,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.6014,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM36.6014,0.0000\nA2.1260,2.1260 180.0000 1,1 34.4754,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.6014,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1039\" >\n<path d=\" \nM34.5013,88.6699\nL34.4484,88.6699\nL25.9709,88.6699\nL25.9709,92.2132\nL25.9709,95.7565\nL34.4748,95.7565\nL42.9787,95.7565\nL42.9787,92.2147\nL42.9787,92.2116\nL42.9787,88.6699\nL34.5013,88.6699\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM29.7085,75.4824\nL27.4539,70.9207\nM28.1946,79.4568\nL20.3028,79.4568\nM32.2204,80.5648\nL29.4250,81.9464\nL28.1946,79.4568\nL27.4944,78.0400\nL26.9131,76.8639\nL29.7085,75.4824\nL32.2204,80.5648\nL34.4749,85.1266\nM34.5013,88.6699\nL34.4484,88.6699\nL25.9709,88.6699\nL25.9709,92.2132\nL25.9709,95.7565\nL34.4748,95.7565\nL42.9787,95.7565\nL42.9787,92.2147\nL42.9787,92.2116\nL42.9787,88.6699\nL34.5013,88.6699\nZ\nM20.3028,79.4568\nL20.3028,92.2131\nL25.9709,92.2131\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"28.8354\" y=\"92.1260\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"-1.9063\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQFA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qfa-n-cable",
    "name": "QFA+N cable",
    "category": "breaker",
    "master_id": null,
    "base_id": null,
    "shape_id": 22,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QFA+N cable (VSS master #22)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.83,
      "h": 75.0
    },
    "paths": 10,
    "texts": [
      "ВВГнг(А)-LS",
      "AFD",
      "QFA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 19.12,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 19.12,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 29.12,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 19.12,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 18.06,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 20.18,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 24.12,
        "y_mm": 31.25,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 19.13,
        "y_mm": 31.29,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 16.64,
        "y_mm": 32.54,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 17.43,
        "y_mm": 26.64,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"15.809 -2.000 68.728 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1040\" >\n<path d=\" \nM54.1909,212.5999\nL54.1909,85.0394\nM54.1909,0.0000\nL54.1909,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker18\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM82.5373,28.3465\nL82.5373,99.2126\nL54.1909,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker18); \"/>\n<path d=\" \nM51.1843,53.9443\nL57.1974,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"18.4415\" y=\"162.9921\" transform=\"rotate(-90.0000, 43.4192, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1041\" >\n<path d=\" \nM56.3169,0.0000\nA2.1260,2.1260 180.0000 1,1 54.1909,-2.1260\nA2.1260,2.1260 180.0000 0,1 56.3169,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM56.3169,0.0000\nA2.1260,2.1260 180.0000 1,1 54.1909,-2.1260\nA2.1260,2.1260 180.0000 0,1 56.3169,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1042\" >\n<path d=\" \nM70.4901,14.1732\nA2.1260,2.1260 180.0000 1,1 68.3641,12.0472\nA2.1260,2.1260 180.0000 0,1 70.4901,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM70.4901,14.1732\nA2.1260,2.1260 180.0000 1,1 68.3641,12.0472\nA2.1260,2.1260 180.0000 0,1 70.4901,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM68.3641,88.5827\nL68.3641,99.2126\nL54.1909,113.3858\nM68.3641,14.1732\nL68.3641,88.5827\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1043\" >\n<path d=\" \nM54.2170,88.6964\nL75.3931,88.6964\nL75.3931,95.7830\nL47.1614,95.7830\nL47.1614,88.6964\nL54.2170,88.6964\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM47.1614,92.2397\nL40.0185,92.2397\nL40.0185,79.4833\nL47.9103,79.4833\nM54.2170,88.6964\nL75.3931,88.6964\nL75.3931,95.7830\nL47.1614,95.7830\nL47.1614,88.6964\nL54.2170,88.6964\nZ\nM54.1906,85.1531\nL49.4242,75.5090\nL46.6289,76.8905\nL49.1408,81.9730\nL51.9361,80.5914\nM47.1697,70.9473\nL49.4242,75.5090\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"55.6375\" y=\"92.1260\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"17.8091\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQFA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "afd-cable",
    "name": "AFD cable",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 23,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "AFD cable (VSS master #23)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.63,
      "h": 75.0
    },
    "paths": 8,
    "texts": [
      "ВВГнг(А)-LS",
      "AFD",
      "AFD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 19.01,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 19.01,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 29.02,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 19.01,
        "y_mm": 45.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 24.02,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 17.96,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 20.08,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 19.03,
        "y_mm": 31.28,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 18.22,
        "y_mm": 28.42,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 14.02,
        "y_mm": 32.5,
        "source": "geometry"
      },
      {
        "id": "p11",
        "x_mm": 17.34,
        "y_mm": 26.62,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"16.097 -2.000 68.152 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1044\" >\n<path d=\" \nM53.9028,212.5999\nL53.9028,85.0394\nM53.9028,0.0000\nL53.9028,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker19\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM82.2492,28.3465\nL82.2492,113.3873\nL53.9028,127.5605\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker19); \"/>\n<defs>\n<marker id=\"startMarker20\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM68.0760,14.1732\nL68.0760,113.3873\nL53.9028,127.5605\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker20); \"/>\n<path d=\" \nM50.8962,53.9443\nL56.9093,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"18.1534\" y=\"177.1668\" transform=\"rotate(-90.0000, 43.1311, 177.1668)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1045\" >\n<path d=\" \nM56.0287,0.0000\nA2.1260,2.1260 180.0000 1,1 53.9028,-2.1260\nA2.1260,2.1260 180.0000 0,1 56.0287,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM56.0287,0.0000\nA2.1260,2.1260 180.0000 1,1 53.9028,-2.1260\nA2.1260,2.1260 180.0000 0,1 56.0287,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1046\" >\n<path d=\" \nM53.9286,88.6567\nL62.4060,88.6567\nL62.4060,95.7434\nL45.3983,95.7434\nL45.3983,88.6567\nL53.9286,88.6567\nZ\nM53.9022,85.1134\nL49.1358,75.4692\nL46.3405,76.8508\nL48.8523,81.9332\nL51.6477,80.5517\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM39.7298,92.1412\nL39.7298,102.7145\nL45.3985,102.7145\nM62.4064,102.7145\nA8.5039,3.5433 180.0000 1,1 53.9025,99.1712\nA8.5039,3.5433 180.0000 0,1 62.4064,102.7145\nZ\nM45.3983,92.2000\nL39.7301,92.2000\nL39.7301,79.4436\nL47.6219,79.4436\nM53.9286,88.6567\nL62.4060,88.6567\nL62.4060,95.7434\nL45.3983,95.7434\nL45.3983,88.6567\nL53.9286,88.6567\nZ\nM53.9022,85.1134\nL49.1358,75.4692\nL46.3405,76.8508\nL48.8523,81.9332\nL51.6477,80.5517\nM46.8813,70.9075\nL49.1358,75.4692\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"48.2628\" y=\"92.1260\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"18.0972\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "afd-n-cable",
    "name": "AFD+N cable",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 24,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "AFD+N cable (VSS master #24)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.63,
      "h": 75.0
    },
    "paths": 10,
    "texts": [
      "ВВГнг(А)-LS",
      "AFD",
      "AFD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 19.01,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 19.01,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 29.02,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 19.01,
        "y_mm": 45.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 17.96,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 20.08,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 24.02,
        "y_mm": 31.25,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 18.22,
        "y_mm": 28.44,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 19.03,
        "y_mm": 31.29,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 16.53,
        "y_mm": 36.23,
        "source": "geometry"
      },
      {
        "id": "p11",
        "x_mm": 16.53,
        "y_mm": 32.54,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"16.097 -2.000 68.152 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1047\" >\n<path d=\" \nM53.9028,212.5999\nL53.9028,85.0394\nM53.9028,0.0000\nL53.9028,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker21\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM82.2492,28.3465\nL82.2492,113.3873\nL53.9028,127.5605\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker21); \"/>\n<path d=\" \nM50.8962,53.9443\nL56.9093,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"18.1534\" y=\"177.1668\" transform=\"rotate(-90.0000, 43.1311, 177.1668)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1048\" >\n<path d=\" \nM56.0287,0.0000\nA2.1260,2.1260 180.0000 1,1 53.9028,-2.1260\nA2.1260,2.1260 180.0000 0,1 56.0287,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM56.0287,0.0000\nA2.1260,2.1260 180.0000 1,1 53.9028,-2.1260\nA2.1260,2.1260 180.0000 0,1 56.0287,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1049\" >\n<path d=\" \nM70.2020,14.1732\nA2.1260,2.1260 180.0000 1,1 68.0760,12.0472\nA2.1260,2.1260 180.0000 0,1 70.2020,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM70.2020,14.1732\nA2.1260,2.1260 180.0000 1,1 68.0760,12.0472\nA2.1260,2.1260 180.0000 0,1 70.2020,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM68.0760,88.5827\nL68.0760,113.3873\nL53.9028,127.5605\nM68.0760,14.1732\nL68.0760,88.5827\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1050\" >\n<path d=\" \nM51.6480,80.6050\nL48.8527,81.9866\nL46.3408,76.9041\nL49.1361,75.5226\nL53.9025,85.1667\nZ\nM53.9290,88.7100\nL46.8733,88.7100\nL46.8733,95.7965\nL75.1050,95.7965\nL75.1050,88.7100\nL53.9290,88.7100\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM46.8733,102.7142\nA14.2859,3.5433 0.0000 0,1 61.1592,99.1709\nA14.2859,3.5433 0.0000 1,1 46.8733,102.7142\nZ\nM39.7304,92.1410\nL39.7304,102.7142\nL46.8733,102.7142\nM49.1361,75.5226\nL46.8816,70.9610\nM51.6480,80.6050\nL48.8527,81.9866\nL46.3408,76.9041\nL49.1361,75.5226\nL53.9025,85.1667\nM53.9290,88.7100\nL46.8733,88.7100\nL46.8733,95.7965\nL75.1050,95.7965\nL75.1050,88.7100\nL53.9290,88.7100\nZ\nM47.6222,79.4969\nL39.7304,79.4969\nL39.7304,92.2532\nL46.8733,92.2532\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"55.3494\" y=\"92.1260\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"18.0972\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "asd-cable",
    "name": "ASD cable",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 25,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "ASD cable (VSS master #25)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.63,
      "h": 75.0
    },
    "paths": 8,
    "texts": [
      "ВВГнг(А)-LS",
      "AFD",
      "ASD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 10.0,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 10.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 20.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 10.0,
        "y_mm": 45.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 15.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 8.94,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 11.06,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 10.01,
        "y_mm": 31.28,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 5.0,
        "y_mm": 32.5,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 7.5,
        "y_mm": 25.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-9.459 -2.000 68.152 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1051\" >\n<path d=\" \nM28.3465,212.5999\nL28.3465,85.0394\nM28.3465,0.0000\nL28.3465,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker22\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM56.6929,28.3465\nL56.6929,113.3873\nL28.3465,127.5605\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker22); \"/>\n<defs>\n<marker id=\"startMarker23\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM42.5197,14.1732\nL42.5197,56.6929\nL28.3465,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker23); \"/>\n<path d=\" \nM25.3399,53.9443\nL31.3530,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-7.4029\" y=\"177.1668\" transform=\"rotate(-90.0000, 17.5748, 177.1668)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1052\" >\n<path d=\" \nM30.4724,0.0000\nA2.1260,2.1260 180.0000 1,1 28.3465,-2.1260\nA2.1260,2.1260 180.0000 0,1 30.4724,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM30.4724,0.0000\nA2.1260,2.1260 180.0000 1,1 28.3465,-2.1260\nA2.1260,2.1260 180.0000 0,1 30.4724,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1053\" >\n<path d=\" \nM28.3723,88.6567\nL36.8497,88.6567\nL36.8497,95.7434\nL19.8420,95.7434\nL19.8420,88.6567\nL28.3723,88.6567\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM14.1735,92.1412\nL14.1735,102.7145\nL19.8422,102.7145\nM36.8501,102.7145\nA8.5039,3.5433 180.0000 1,1 28.3462,99.1712\nA8.5039,3.5433 180.0000 0,1 36.8501,102.7145\nZ\nM19.8420,92.2000\nL14.1738,92.2000\nL14.1738,77.9776\nL24.3780,77.9776\nM28.3723,88.6567\nL36.8497,88.6567\nL36.8497,95.7434\nL19.8420,95.7434\nL19.8420,88.6567\nL28.3723,88.6567\nZ\nM28.3459,85.1134\nL26.0914,80.5517\nL21.2598,70.8676\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"22.7065\" y=\"92.1260\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"-7.4591\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nASD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "asd-n-cable",
    "name": "ASD+N cable",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 26,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "ASD+N cable (VSS master #26)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.63,
      "h": 75.0
    },
    "paths": 10,
    "texts": [
      "ВВГнг(А)-LS",
      "AFD",
      "ASD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 11.0,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 11.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 21.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 11.0,
        "y_mm": 45.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 9.94,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 12.06,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 16.0,
        "y_mm": 31.25,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 11.01,
        "y_mm": 31.29,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 8.52,
        "y_mm": 36.23,
        "source": "geometry"
      },
      {
        "id": "p10",
        "x_mm": 8.52,
        "y_mm": 32.54,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-6.624 -2.000 68.152 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1054\" >\n<path d=\" \nM31.1811,212.5999\nL31.1811,85.0394\nM31.1811,0.0000\nL31.1811,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker24\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM59.5276,28.3465\nL59.5276,113.3873\nL31.1811,127.5605\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker24); \"/>\n<path d=\" \nM28.1745,53.9443\nL34.1876,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-4.5683\" y=\"177.1668\" transform=\"rotate(-90.0000, 20.4094, 177.1668)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1055\" >\n<path d=\" \nM33.3071,0.0000\nA2.1260,2.1260 180.0000 1,1 31.1811,-2.1260\nA2.1260,2.1260 180.0000 0,1 33.3071,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM33.3071,0.0000\nA2.1260,2.1260 180.0000 1,1 31.1811,-2.1260\nA2.1260,2.1260 180.0000 0,1 33.3071,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<g id=\"Layer1056\" >\n<path d=\" \nM47.4803,14.1732\nA2.1260,2.1260 180.0000 1,1 45.3543,12.0472\nA2.1260,2.1260 180.0000 0,1 47.4803,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM47.4803,14.1732\nA2.1260,2.1260 180.0000 1,1 45.3543,12.0472\nA2.1260,2.1260 180.0000 0,1 47.4803,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM45.3543,88.5827\nL45.3543,113.3873\nL31.1811,127.5605\nM45.3543,14.1732\nL45.3543,88.5827\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1057\" >\n<path d=\" \nM31.2073,88.7100\nL24.1517,88.7100\nL24.1517,95.7965\nL52.3833,95.7965\nL52.3833,88.7100\nL31.2073,88.7100\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM24.1517,102.7142\nA14.2859,3.5433 0.0000 0,1 38.4376,99.1709\nA14.2859,3.5433 0.0000 1,1 24.1517,102.7142\nZ\nM17.0087,92.1410\nL17.0087,102.7142\nL24.1517,102.7142\nM24.1585,70.9608\nL31.1809,85.1667\nM31.2073,88.7100\nL24.1517,88.7100\nL24.1517,95.7965\nL52.3833,95.7965\nL52.3833,88.7100\nL31.2073,88.7100\nZ\nM27.2129,77.9778\nL17.0088,77.9778\nL17.0088,92.2532\nL24.1517,92.2532\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"32.6277\" y=\"92.1260\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"-4.6244\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nASD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "q-cable",
    "name": "Q cable",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 27,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Q cable (VSS master #27)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.61,
      "h": 75.0
    },
    "paths": 7,
    "texts": [
      "ВВГнг(А)-LS",
      "Q"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 22.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 12.0,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 17.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 10.94,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 13.06,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 9.5,
        "y_mm": 25.0,
        "source": "geometry"
      },
      {
        "id": "p9",
        "x_mm": 10.92,
        "y_mm": 29.26,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-3.734 -2.000 68.096 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1058\" >\n<path d=\" \nM34.0157,212.5999\nL34.0157,85.0394\nM34.0157,0.0000\nL34.0157,70.8661\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker25\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM62.3622,28.3465\nL62.3622,99.2126\nL34.0157,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker25); \"/>\n<defs>\n<marker id=\"startMarker26\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM48.1890,14.1732\nL48.1890,99.2126\nL34.0157,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker26); \"/>\n<path d=\" \nM31.0092,53.9443\nL37.0223,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-1.7336\" y=\"162.9921\" transform=\"rotate(-90.0000, 23.2441, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1059\" >\n<path d=\" \nM36.1417,0.0000\nA2.1260,2.1260 180.0000 1,1 34.0157,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.1417,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM36.1417,0.0000\nA2.1260,2.1260 180.0000 1,1 34.0157,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.1417,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM26.9291,70.8662\nL34.0157,85.0394\nM30.9584,82.9503\nL27.2306,75.3070\nL30.2879,73.8159\nL34.0157,81.4591\nL30.9584,82.9503\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"12.2670\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQ</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "fu-cable",
    "name": "FU cable",
    "category": "protection",
    "master_id": null,
    "base_id": null,
    "shape_id": 28,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "FU cable (VSS master #28)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.61,
      "h": 75.0
    },
    "paths": 7,
    "texts": [
      "ВВГнг(А)-LS",
      "FU"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 75.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 27.5,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 22.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 12.0,
        "y_mm": 40.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 17.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 10.94,
        "y_mm": 19.03,
        "source": "geometry"
      },
      {
        "id": "p7",
        "x_mm": 13.06,
        "y_mm": 16.91,
        "source": "geometry"
      },
      {
        "id": "p8",
        "x_mm": 10.75,
        "y_mm": 31.25,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-3.734 -2.000 68.096 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1060\" >\n<path d=\" \nM34.0157,212.5999\nL34.0157,77.9528\nM34.0157,0.0000\nL34.0157,77.9528\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker27\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM62.3622,28.3465\nL62.3622,99.2126\nL34.0157,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker27); \"/>\n<defs>\n<marker id=\"startMarker28\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM48.1890,14.1732\nL48.1890,99.2126\nL34.0157,113.3858\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker28); \"/>\n<path d=\" \nM31.0092,53.9443\nL37.0223,47.9311\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-1.7336\" y=\"162.9921\" transform=\"rotate(-90.0000, 23.2441, 162.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n<g id=\"Layer1061\" >\n<path d=\" \nM36.1417,0.0000\nA2.1260,2.1260 180.0000 1,1 34.0157,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.1417,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM36.1417,0.0000\nA2.1260,2.1260 180.0000 1,1 34.0157,-2.1260\nA2.1260,2.1260 180.0000 0,1 36.1417,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM30.4724,88.5827\nL30.4724,67.3228\nL37.5591,67.3228\nL37.5591,88.5827\nL30.4724,88.5827\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"7.9848\" y=\"77.9528\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nFU</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "cable",
    "name": "Cable",
    "category": "cable",
    "master_id": null,
    "base_id": null,
    "shape_id": 29,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Cable (VSS master #29)",
    "width_mm": 25.4,
    "height_mm": 75.0,
    "aspect_ratio": 0.339,
    "bbox_mm": {
      "w": 22.81,
      "h": 75.0
    },
    "paths": 5,
    "texts": [
      "ВВГнг(А)-LS"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 14.4,
        "y_mm": 0.7,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 14.4,
        "y_mm": 75.7,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 24.4,
        "y_mm": 10.7,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 14.4,
        "y_mm": 40.7,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 19.4,
        "y_mm": 5.7,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"2.492 -0.016 68.663 216.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1062\" >\n<path d=\" \nM40.8088,1.9843\nL40.8088,214.5841\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<defs>\n<marker id=\"startMarker29\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM69.1552,30.3307\nL69.1552,101.1969\nL40.8088,115.3701\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker29); \"/>\n<defs>\n<marker id=\"startMarker30\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM54.9820,16.1575\nL54.9820,101.1969\nL40.8088,115.3701\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker30); \"/>\n<g id=\"Layer1063\" >\n<path d=\" \nM42.9348,1.9843\nA2.1260,2.1260 180.0000 1,1 40.8088,-0.1417\nA2.1260,2.1260 180.0000 0,1 42.9348,1.9843\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #000000; \"/>\n<path d=\" \nM42.9348,1.9843\nA2.1260,2.1260 180.0000 1,1 40.8088,-0.1417\nA2.1260,2.1260 180.0000 0,1 42.9348,1.9843\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"4.4925\" y=\"164.9764\" transform=\"rotate(-90.0000, 29.4702, 164.9764)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nВВГнг(А)-LS</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "pv",
    "name": "PV",
    "category": "meter",
    "master_id": null,
    "base_id": null,
    "shape_id": 30,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "PV (VSS master #30)",
    "width_mm": 15.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.591,
    "bbox_mm": {
      "w": 15.0,
      "h": 8.12
    },
    "paths": 3,
    "texts": [
      "V",
      "PV"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.9,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.5,
        "y_mm": 12.9,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 11.557 46.520 27.010\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1064\" >\n<path d=\" \nM0.0000,36.5669\nL7.0866,36.5669\nM42.5197,36.5669\nL35.4331,36.5669\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1065\" >\n<path d=\" \nM35.4331,36.5669\nA14.1732,14.1732 180.0000 1,1 21.2598,22.3937\nA14.1732,14.1732 180.0000 0,1 35.4331,36.5669\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM35.4331,36.5669\nA14.1732,14.1732 180.0000 1,1 21.2598,22.3937\nA14.1732,14.1732 180.0000 0,1 35.4331,36.5669\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"17.2907\" y=\"36.5669\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nV</tspan>\n</text>\n<text x=\"14.7077\" y=\"13.5572\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nPV</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "t",
    "name": "T",
    "category": "transformer",
    "master_id": null,
    "base_id": null,
    "shape_id": 31,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "T (VSS master #31)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 11.27,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "T"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.5,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.5,
        "y_mm": 1.25,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 16.25,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 16.25,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"12.123 -2.000 35.940 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1066\" >\n<path d=\" \nM35.4331,42.5197\nL35.4331,38.9764\nM35.4331,0.0000\nL35.4331,3.5433\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM46.0629,14.1732\nA10.6300,10.6299 180.0000 0,1 35.4329,24.8031\nA10.6300,10.6299 180.0000 1,1 46.0629,14.1732\nZ\nM46.0629,28.3464\nA10.6300,10.6299 180.0000 0,1 35.4329,38.9763\nA10.6300,10.6299 180.0000 1,1 46.0629,28.3464\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"14.1225\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nT</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "pa",
    "name": "PA",
    "category": "meter",
    "master_id": null,
    "base_id": null,
    "shape_id": 32,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "PA (VSS master #32)",
    "width_mm": 15.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.591,
    "bbox_mm": {
      "w": 15.0,
      "h": 8.12
    },
    "paths": 3,
    "texts": [
      "A",
      "PA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.4,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.5,
        "y_mm": 12.4,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 10.140 46.520 27.010\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1067\" >\n<path d=\" \nM0.0000,35.1496\nL7.0866,35.1496\nM42.5197,35.1496\nL35.4331,35.1496\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1068\" >\n<path d=\" \nM35.4331,35.1496\nA14.1732,14.1732 180.0000 1,1 21.2598,20.9764\nA14.1732,14.1732 180.0000 0,1 35.4331,35.1496\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM35.4331,35.1496\nA14.1732,14.1732 180.0000 1,1 21.2598,20.9764\nA14.1732,14.1732 180.0000 0,1 35.4331,35.1496\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"17.2346\" y=\"35.1496\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nA</tspan>\n</text>\n<text x=\"14.6516\" y=\"12.1399\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nPA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "pw",
    "name": "PW",
    "category": "meter",
    "master_id": null,
    "base_id": null,
    "shape_id": 33,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "PW (VSS master #33)",
    "width_mm": 15.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.591,
    "bbox_mm": {
      "w": 15.0,
      "h": 8.12
    },
    "paths": 3,
    "texts": [
      "W",
      "PW"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.4,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.5,
        "y_mm": 12.4,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 10.140 46.520 27.010\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1069\" >\n<path d=\" \nM0.0000,35.1496\nL7.0866,35.1496\nM42.5197,35.1496\nL35.4331,35.1496\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1070\" >\n<path d=\" \nM35.4331,35.1496\nA14.1732,14.1732 180.0000 1,1 21.2598,20.9764\nA14.1732,14.1732 180.0000 0,1 35.4331,35.1496\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM35.4331,35.1496\nA14.1732,14.1732 180.0000 1,1 21.2598,20.9764\nA14.1732,14.1732 180.0000 0,1 35.4331,35.1496\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"15.6795\" y=\"35.1496\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nW</tspan>\n</text>\n<text x=\"13.0964\" y=\"12.1399\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nPW</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "pi",
    "name": "PI",
    "category": "meter",
    "master_id": "14",
    "base_id": "{363F708A-ED71-4481-B299-0E79F08F2C8D}",
    "shape_id": 34,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "PI (VSS master #34)",
    "width_mm": 25.4,
    "height_mm": 14.0,
    "aspect_ratio": 1.814,
    "bbox_mm": {
      "w": 15.51,
      "h": 14.0
    },
    "paths": 3,
    "texts": [
      "Wh",
      "PI"
    ],
    "props": [
      {
        "key": "PI",
        "label": "Счетчик",
        "value": "Wh"
      },
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": "PI"
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": "PI"
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      },
      {
        "key": "Mark",
        "label": "Марка",
        "value": ""
      },
      {
        "key": "Name",
        "label": "Наименование",
        "value": "0"
      },
      {
        "key": "Article",
        "label": "Артикул",
        "value": "0"
      },
      {
        "key": "Nominal",
        "label": "Номинал",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 14.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "in_1",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out_1",
        "x_mm": 14.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "Row_11",
        "x_mm": 14.0,
        "y_mm": 2.5,
        "source": "visio-master"
      },
      {
        "id": "Row_12",
        "x_mm": 14.0,
        "y_mm": -2.5,
        "source": "visio-master"
      },
      {
        "id": "Row_13",
        "x_mm": 0.0,
        "y_mm": 2.5,
        "source": "visio-master"
      },
      {
        "id": "Row_14",
        "x_mm": 0.0,
        "y_mm": -2.5,
        "source": "visio-master"
      },
      {
        "id": "Row_15",
        "x_mm": 9.5,
        "y_mm": 5.0,
        "source": "visio-master"
      },
      {
        "id": "Row_16",
        "x_mm": 7.0,
        "y_mm": 5.0,
        "source": "visio-master"
      },
      {
        "id": "Row_17",
        "x_mm": 4.5,
        "y_mm": 5.0,
        "source": "visio-master"
      },
      {
        "id": "Row_18",
        "x_mm": 9.5,
        "y_mm": -5.0,
        "source": "visio-master"
      },
      {
        "id": "Row_19",
        "x_mm": 7.0,
        "y_mm": -5.0,
        "source": "visio-master"
      },
      {
        "id": "Row_20",
        "x_mm": 4.5,
        "y_mm": -5.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"5.058 -2.000 47.966 43.685\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1071\" >\n<path d=\" \nM36.8504,39.6850\nZ\nM36.8504,0.0000\nZ\nM29.7638,39.6850\nZ\nM43.9370,39.6850\nZ\nM29.7638,0.0000\nZ\nM43.9370,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1072\" >\n<path d=\" \nM22.6772,39.6850\nL22.6772,0.0000\nL51.0236,0.0000\nL51.0236,39.6850\nL22.6772,39.6850\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM51.0236,11.3386\nL22.6772,11.3386\nM22.6772,39.6850\nL22.6772,0.0000\nL51.0236,0.0000\nL51.0236,39.6850\nL22.6772,39.6850\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"28.6430\" y=\"25.5118\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nWh</tspan>\n</text>\n<text x=\"7.0581\" y=\"19.8425\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nPI</tspan>\n</text>\n</g></svg>",
    "errors": []
  },
  {
    "id": "kv",
    "name": "KV",
    "category": "contactor",
    "master_id": null,
    "base_id": null,
    "shape_id": 35,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "KV (VSS master #35)",
    "width_mm": 25.4,
    "height_mm": 20.0,
    "aspect_ratio": 1.27,
    "bbox_mm": {
      "w": 17.13,
      "h": 20.0
    },
    "paths": 3,
    "texts": [
      "&lt;U&lt;",
      "KV"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 20.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 17.0,
        "y_mm": 10.95,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 9.5,
        "y_mm": 15.95,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 9.5,
        "y_mm": 3.45,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"4.709 -2.000 52.567 60.693\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1073\" >\n<path d=\" \nM34.0157,56.6929\nL34.0157,45.2126\nM34.0157,0.0000\nL34.0157,9.7795\nM48.1890,45.2126\nZ\nM48.1890,31.0394\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1074\" >\n<path d=\" \nM26.9291,45.2126\nL26.9291,31.0394\nL55.2756,31.0394\nL55.2756,45.2126\nL26.9291,45.2126\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM26.9291,45.2126\nL26.9291,31.0394\nL55.2756,31.0394\nL55.2756,45.2126\nL26.9291,45.2126\nZ\nM34.0157,31.0470\nL34.0157,23.9528\nL26.9291,9.7795\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"31.7818\" y=\"38.8346\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n&lt;U&lt;</tspan>\n</text>\n<text x=\"6.7089\" y=\"38.2677\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nKV</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "kv1",
    "name": "KV1",
    "category": "contactor",
    "master_id": null,
    "base_id": null,
    "shape_id": 36,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "KV1 (VSS master #36)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 16.8,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "&lt;U&lt;",
      "KV"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 17.35,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 22.35,
        "y_mm": 0.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 14.85,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"20.816 -2.000 51.629 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1075\" >\n<path d=\" \nM49.1844,42.5197\nL49.1844,28.3465\nM49.1844,0.0000\nL49.1844,14.1732\nM63.3577,28.3465\nL63.3577,42.5197\nM63.3577,14.1732\nL63.3577,0.0000\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1076\" >\n<path d=\" \nM42.0978,28.3465\nL70.4443,28.3465\nL70.4443,14.1732\nL42.0978,14.1732\nL42.0978,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM42.0978,28.3465\nL70.4443,28.3465\nL70.4443,14.1732\nL42.0978,14.1732\nL42.0978,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"46.9505\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n&lt;U&lt;</tspan>\n</text>\n<text x=\"22.8156\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nKV</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "k",
    "name": "K",
    "category": "contactor",
    "master_id": null,
    "base_id": null,
    "shape_id": 37,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "K (VSS master #37)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 14.63,
      "h": 15.0
    },
    "paths": 4,
    "texts": [
      "&lt;U&lt;",
      "K"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 17.52,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 17.52,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 12.52,
        "y_mm": 7.5,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 22.51,
        "y_mm": 7.5,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 12.52,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"20.349 -2.000 45.475 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1077\" >\n<path d=\" \nM49.6511,42.5197\nL49.6511,28.3465\nM49.6511,0.0000\nL49.6511,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM35.4779,21.2598\nL63.8244,21.2598\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 4.5000, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1078\" >\n<path d=\" \nM35.4779,28.3465\nL63.8244,28.3465\nL63.8244,14.1732\nL35.4779,14.1732\nL35.4779,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM35.4779,28.3465\nL63.8244,28.3465\nL63.8244,14.1732\nL35.4779,14.1732\nL35.4779,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"40.3306\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n&lt;U&lt;</tspan>\n</text>\n<text x=\"22.3489\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nK</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "hl",
    "name": "HL",
    "category": "signal",
    "master_id": null,
    "base_id": null,
    "shape_id": 38,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "HL (VSS master #38)",
    "width_mm": 25.4,
    "height_mm": 10.0,
    "aspect_ratio": 2.54,
    "bbox_mm": {
      "w": 10.98,
      "h": 10.0
    },
    "paths": 3,
    "texts": [
      "HL"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 2.5,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 13.73,
        "y_mm": 6.73,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 14.5,
        "y_mm": 5.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"7.978 -2.000 35.124 32.346\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1079\" >\n<path d=\" \nM34.0157,28.3465\nL34.0157,21.2598\nM34.0157,0.0000\nL34.0157,7.0866\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1080\" >\n<path d=\" \nM41.1024,14.1732\nA7.0866,7.0866 180.0000 0,1 34.0157,21.2598\nA7.0866,7.0866 180.0000 1,1 41.1024,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM38.9265,19.0840\nL29.1050,9.2624\nM38.9265,9.2624\nL29.1050,19.0840\nM41.1024,14.1732\nA7.0866,7.0866 180.0000 0,1 34.0157,21.2598\nA7.0866,7.0866 180.0000 1,1 41.1024,14.1732\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"9.9780\" y=\"14.1732\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nHL</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "ta",
    "name": "TA",
    "category": "transformer",
    "master_id": null,
    "base_id": null,
    "shape_id": 39,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "TA (VSS master #39)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 10.43,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "TA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 7.5,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 13.87,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 13.87,
        "y_mm": 5.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"7.754 -2.000 33.577 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1081\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,21.2598\nM34.0157,0.0000\nL34.0157,21.2598\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM39.3307,28.3465\nL32.2441,28.3465\nA3.5433,3.5433 0.0000 0,1 32.2441,21.2598\nA3.5433,3.5433 0.0000 0,1 32.2441,14.1732\nL39.3307,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"9.7536\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nTA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "ru",
    "name": "RU",
    "category": "contactor",
    "master_id": null,
    "base_id": null,
    "shape_id": 40,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "RU (VSS master #40)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 11.48,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "RU"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 3.75,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 15.5,
        "y_mm": 4.37,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 13.25,
        "y_mm": 3.75,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"9.402 -2.000 36.534 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1082\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,31.8898\nM34.0157,0.0000\nL34.0157,10.6299\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM43.9360,12.4016\nL26.2195,30.1181\nL20.5502,30.1181\nM37.5581,10.6299\nL37.5581,31.8898\nL30.4714,31.8898\nL30.4714,10.6299\nL37.5581,10.6299\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"11.4018\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nRU</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "km",
    "name": "KM",
    "category": "contactor",
    "master_id": null,
    "base_id": null,
    "shape_id": 41,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "KM (VSS master #41)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 17.65,
      "h": 15.0
    },
    "paths": 4,
    "texts": [
      "KM"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 7.0,
        "y_mm": 7.5,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 17.0,
        "y_mm": 7.5,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 7.0,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-3.836 -2.000 54.025 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1083\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,28.3465\nM34.0157,0.0000\nL34.0157,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM19.8425,21.2598\nL48.1890,21.2598\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 4.5000, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1084\" >\n<path d=\" \nM19.8425,28.3465\nL48.1890,28.3465\nL48.1890,14.1732\nL19.8425,14.1732\nL19.8425,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM19.8425,28.3465\nL48.1890,28.3465\nL48.1890,14.1732\nL19.8425,14.1732\nL19.8425,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"-1.8364\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nKM</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "fu",
    "name": "FU",
    "category": "protection",
    "master_id": null,
    "base_id": null,
    "shape_id": 42,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "FU (VSS master #42)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 8.93,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "FU"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 7.5,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 10.75,
        "y_mm": 11.25,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"10.237 -2.000 29.322 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1085\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,21.2598\nM34.0157,0.0000\nL34.0157,21.2598\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM30.4724,31.8898\nL30.4724,10.6299\nL37.5591,10.6299\nL37.5591,31.8898\nL30.4724,31.8898\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"12.2367\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nFU</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "q",
    "name": "Q",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 43,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Q (VSS master #43)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 7.67,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "Q"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 11.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 11.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 8.5,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 9.92,
        "y_mm": 9.26,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"7.432 -2.000 25.749 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1086\" >\n<path d=\" \nM31.1811,42.5197\nL31.1811,28.3465\nM31.1811,0.0000\nL31.1811,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM24.0945,14.1732\nL31.1811,28.3464\nM28.1238,26.2574\nL24.3959,18.6141\nL27.4532,17.1230\nL31.1811,24.7662\nL28.1238,26.2574\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"9.4323\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQ</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qf",
    "name": "QF",
    "category": "breaker",
    "master_id": "16",
    "base_id": "{5A31CEFD-D055-41C3-ADFC-642C3C554B41}",
    "shape_id": 44,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QF (VSS master #44)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 9.29,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "QF"
    ],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": "QF"
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": "QF"
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      },
      {
        "key": "Mark",
        "label": "Марка",
        "value": ""
      },
      {
        "key": "Name",
        "label": "Наименование",
        "value": "0"
      },
      {
        "key": "Article",
        "label": "Артикул",
        "value": "0"
      },
      {
        "key": "Nominal",
        "label": "Номинал",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 15.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "in_1",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out_1",
        "x_mm": 15.0,
        "y_mm": 0.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"2.838 -2.000 30.343 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1087\" >\n<path d=\" \nM31.1811,42.5197\nL31.1811,28.3465\nM31.1811,0.0000\nL31.1811,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1088\" >\n<path d=\" \nM26.4147,18.7186\nL23.6194,20.1002\nL26.1313,25.1826\nL28.9266,23.8011\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM31.1811,28.3628\nL24.1602,14.1570\nM26.4147,18.7186\nL23.6194,20.1002\nL26.1313,25.1826\nL28.9266,23.8011\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"4.8376\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQF</tspan>\n</text>\n</g></svg>",
    "errors": []
  },
  {
    "id": "qf-n",
    "name": "QF+N",
    "category": "breaker",
    "master_id": null,
    "base_id": null,
    "shape_id": 45,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QF+N (VSS master #45)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 14.29,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "QF"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 9.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 14.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 12.45,
        "y_mm": 7.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 8.21,
        "y_mm": 8.39,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.832 -2.000 44.517 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1089\" >\n<path d=\" \nM25.5118,42.5197\nL25.5118,28.3465\nM25.5118,0.0000\nL25.5118,14.1732\nM39.6850,42.5197\nL39.6850,28.3465\nM39.6850,0.0000\nL39.6850,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM35.2913,19.8425\nL21.4016,19.8425\nM36.8503,22.6772\nL22.8189,22.6772\nM32.5984,14.1407\nL39.6850,28.3138\nM25.5118,28.3465\nL18.4909,14.1407\nM20.7454,18.7023\nL17.9501,20.0839\nL20.4620,25.1663\nL23.2573,23.7848\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-0.8317\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQF</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qs",
    "name": "QS",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 46,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QS (VSS master #46)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 9.29,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "QS"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 12.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 9.52,
        "y_mm": 5.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"5.672 -2.000 30.344 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1090\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,28.3465\nM34.0157,0.0000\nL34.0157,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM34.0157,28.3628\nL26.9949,14.1570\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"7.6722\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQS</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qs-n",
    "name": "QS+N",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 47,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QS+N (VSS master #47)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 14.29,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "QS"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 10.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 13.45,
        "y_mm": 7.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 7.52,
        "y_mm": 4.99,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0.003 -2.000 44.517 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1091\" >\n<path d=\" \nM28.3465,42.5197\nL28.3465,28.3465\nM28.3465,0.0000\nL28.3465,14.1732\nM42.5197,42.5197\nL42.5197,28.3465\nM42.5197,0.0000\nL42.5197,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM38.1259,19.8425\nL24.2363,19.8425\nM39.6850,22.6772\nL25.6536,22.6772\nM35.4331,14.1407\nL42.5196,28.3138\nM28.3465,28.3465\nL21.3255,14.1407\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"2.0029\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQS</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qfd",
    "name": "QFD",
    "category": "rcbo",
    "master_id": "15",
    "base_id": "{AE4AA73F-4B1B-49F4-8E13-C3C2DC4656F3}",
    "shape_id": 48,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QFD (VSS master #48)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 15.96,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "QFD"
    ],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": "QFD"
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": "QFD"
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      },
      {
        "key": "Mark",
        "label": "Марка",
        "value": ""
      },
      {
        "key": "Name",
        "label": "Наименование",
        "value": "0"
      },
      {
        "key": "Article",
        "label": "Артикул",
        "value": "0"
      },
      {
        "key": "Nominal",
        "label": "Номинал",
        "value": ""
      },
      {
        "key": "Leakage",
        "label": "Дифф. ток",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 15.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "in_1",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out_1",
        "x_mm": 15.0,
        "y_mm": 0.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4.732 -2.000 49.251 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1092\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,28.3465\nM34.0157,0.0000\nL34.0157,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1093\" >\n<path d=\" \nM31.7608,23.7836\nL28.9655,25.1651\nL26.4536,20.0827\nL29.2490,18.7011\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM42.5193,35.4319\nA8.5039,3.5433 180.0000 1,1 34.0153,31.8886\nA8.5039,3.5433 180.0000 0,1 42.5193,35.4319\nZ\nM25.5114,35.4319\nL19.8432,35.4319\nL19.8432,22.6755\nL27.7787,22.6755\nM31.7608,23.7836\nL28.9655,25.1651\nL26.4536,20.0827\nL29.2490,18.7011\nM26.9944,14.1394\nL34.0154,28.3453\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"-2.7321\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQFD</tspan>\n</text>\n</g></svg>",
    "errors": []
  },
  {
    "id": "qfd-n",
    "name": "QFD+N",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 49,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QFD+N (VSS master #49)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 20.46,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "QFD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 10.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 14.0,
        "y_mm": 8.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 7.49,
        "y_mm": 12.51,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-10.401 -2.000 62.008 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1094\" >\n<path d=\" \nM28.3465,42.5197\nL28.3465,28.3465\nM28.3465,0.0000\nL28.3465,14.1732\nM42.5197,42.5197\nL42.5197,28.3465\nM42.5197,0.0000\nL42.5197,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM39.6850,22.6920\nL25.6535,22.6920\nM38.1260,19.8574\nL24.2362,19.8574\nM49.6063,35.4479\nA14.1404,3.5433 180.0000 0,1 35.4659,38.9912\nA14.1404,3.5433 180.0000 1,1 49.6063,35.4479\nZ\nM35.4331,14.1555\nL42.5197,28.3287\nM28.3465,28.3613\nL21.3255,14.1555\nM23.5800,18.7172\nL20.7847,20.0987\nL23.2966,25.1812\nL26.0919,23.7996\nM22.0394,22.6915\nL14.1732,22.6915\nL14.1732,35.4479\nL21.2233,35.4479\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-8.4014\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQFD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qd",
    "name": "QD",
    "category": "rcd",
    "master_id": null,
    "base_id": null,
    "shape_id": 50,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QD (VSS master #50)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 14.34,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "QD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 13.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 13.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 16.0,
        "y_mm": 12.5,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 13.0,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"2.697 -2.000 44.657 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1095\" >\n<path d=\" \nM36.8504,42.5197\nL36.8504,28.3465\nM36.8504,0.0000\nL36.8504,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM45.3539,35.4319\nA8.5039,3.5433 180.0000 1,1 36.8500,31.8886\nA8.5039,3.5433 180.0000 0,1 45.3539,35.4319\nZ\nM28.3461,35.4319\nL22.6779,35.4319\nL22.6779,21.3418\nL33.3356,21.3418\nM29.8291,14.1394\nL36.8500,28.3453\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"4.6973\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qd-n",
    "name": "QD+N",
    "category": "rcd",
    "master_id": null,
    "base_id": null,
    "shape_id": 51,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QD+N (VSS master #51)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 18.84,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "QD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 9.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 14.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 13.0,
        "y_mm": 8.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 6.49,
        "y_mm": 12.51,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-8.641 -2.000 57.413 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1096\" >\n<path d=\" \nM25.5118,42.5197\nL25.5118,28.3465\nM25.5118,0.0000\nL25.5118,14.1732\nM39.6850,42.5197\nL39.6850,28.3465\nM39.6850,0.0000\nL39.6850,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM36.8504,22.6920\nL22.8189,22.6920\nM35.2913,19.8574\nL21.4016,19.8574\nM46.7716,35.4479\nA14.1404,3.5433 180.0000 0,1 32.6312,38.9912\nA14.1404,3.5433 180.0000 1,1 46.7716,35.4479\nZ\nM32.5984,14.1555\nL39.6850,28.3287\nM25.5118,28.3613\nL18.4908,14.1555\nM21.9685,21.3578\nL11.3386,21.3578\nL11.3386,35.4479\nL18.3886,35.4479\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-6.6413\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qsa",
    "name": "QSA",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 52,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QSA (VSS master #52)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 15.83,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "AFD",
      "QSA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.6,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.6,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 9.6,
        "y_mm": 13.75,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 12.6,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.665 -2.000 48.885 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1097\" >\n<path d=\" \nM35.7165,42.5197\nL35.7165,28.3465\nM35.7165,0.0000\nL35.7165,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1098\" >\n<path d=\" \nM27.2122,38.9752\nL27.2122,31.8886\nL44.2200,31.8886\nL44.2200,38.9752\nL27.2122,38.9752\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM35.7161,28.3453\nL28.6952,14.1395\nM32.0302,21.2587\nL21.5440,21.2587\nL21.5440,35.4319\nL27.2122,35.4319\nM27.2122,38.9752\nL27.2122,31.8886\nL44.2200,31.8886\nL44.2200,38.9752\nL27.2122,38.9752\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"30.0766\" y=\"35.4331\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"-0.6652\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQSA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qsa-n",
    "name": "QSA N",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 53,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QSA N (VSS master #53)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 20.33,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "AFD",
      "QSA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 10.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.0,
        "y_mm": 11.25,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 7.52,
        "y_mm": 13.75,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 10.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 7.4,
        "y_mm": 12.51,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-10.035 -2.000 61.642 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1099\" >\n<path d=\" \nM28.3465,42.5197\nL28.3465,28.3465\nM28.3465,0.0000\nL28.3465,14.1732\nM42.5197,42.5197\nL42.5197,31.8898\nM42.5197,0.0000\nL42.5197,31.8898\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1100\" >\n<path d=\" \nM21.3256,38.9901\nL21.3256,31.9035\nL49.6063,31.9035\nL49.6063,38.9901\nL21.3256,38.9901\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM28.3465,28.3602\nL21.3255,14.1544\nM21.3256,38.9901\nL21.3256,31.9035\nL49.6063,31.9035\nL49.6063,38.9901\nL21.3256,38.9901\nZ\nM24.5440,21.2409\nL14.1732,21.2409\nL14.1732,35.4468\nL20.9679,35.4468\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"29.7931\" y=\"35.4331\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"-8.0353\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQSA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qfa",
    "name": "QFA",
    "category": "breaker",
    "master_id": null,
    "base_id": null,
    "shape_id": 54,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QFA (VSS master #54)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 15.83,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "AFD",
      "QFA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 735.4,
        "y_mm": -534.3,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 735.4,
        "y_mm": -544.3,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 735.41,
        "y_mm": -538.02,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 733.72,
        "y_mm": -542.67,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 732.4,
        "y_mm": -536.77,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"2046.217 -1559.071 48.885 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1101\" >\n<path d=\" \nM2084.5984,-1514.5512\nL2084.5984,-1528.7244\nM2084.5984,-1557.0709\nL2084.5984,-1542.8976\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1102\" >\n<path d=\" \nM2084.6243,-1525.0939\nL2084.5714,-1525.0939\nL2076.0939,-1525.0939\nL2076.0939,-1521.5506\nL2076.0939,-1518.0073\nL2084.5978,-1518.0073\nL2093.1017,-1518.0073\nL2093.1017,-1521.5491\nL2093.1017,-1521.5522\nL2093.1017,-1525.0939\nL2084.6243,-1525.0939\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM2079.8315,-1538.2814\nL2077.5770,-1542.8431\nM2078.3176,-1534.3070\nL2070.4258,-1534.3070\nM2082.3434,-1533.1989\nL2079.5480,-1531.8174\nL2078.3176,-1534.3070\nL2077.6174,-1535.7238\nL2077.0361,-1536.8998\nL2079.8315,-1538.2814\nL2082.3434,-1533.1989\nL2084.5979,-1528.6372\nM2084.6243,-1525.0939\nL2084.5714,-1525.0939\nL2076.0939,-1525.0939\nL2076.0939,-1521.5506\nL2076.0939,-1518.0073\nL2084.5978,-1518.0073\nL2093.1017,-1518.0073\nL2093.1017,-1521.5491\nL2093.1017,-1521.5522\nL2093.1017,-1525.0939\nL2084.6243,-1525.0939\nZ\nM2070.4258,-1534.3070\nL2070.4258,-1521.5506\nL2076.0939,-1521.5506\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"2078.9584\" y=\"-1521.6378\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"2048.2167\" y=\"-1535.8110\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQFA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "afd",
    "name": "AFD",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 55,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "AFD (VSS master #55)",
    "width_mm": 25.4,
    "height_mm": 20.0,
    "aspect_ratio": 1.27,
    "bbox_mm": {
      "w": 15.63,
      "h": 20.0
    },
    "paths": 3,
    "texts": [
      "AFD",
      "AFD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 19.01,
        "y_mm": 20.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 19.01,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 19.03,
        "y_mm": 11.27,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 18.22,
        "y_mm": 8.42,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 14.02,
        "y_mm": 12.51,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 17.34,
        "y_mm": 6.63,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"16.097 -2.000 48.309 60.694\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1103\" >\n<path d=\" \nM53.9028,56.6944\nL53.9028,28.3465\nM53.9028,0.0000\nL53.9028,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1104\" >\n<path d=\" \nM53.9286,31.9638\nL62.4060,31.9638\nL62.4060,39.0504\nL45.3983,39.0504\nL45.3983,31.9638\nL53.9286,31.9638\nZ\nM53.9022,28.4205\nL49.1358,18.7763\nL46.3405,20.1579\nL48.8523,25.2403\nL51.6477,23.8588\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM39.7298,35.4483\nL39.7298,46.0216\nL45.3985,46.0216\nM62.4064,46.0216\nA8.5039,3.5433 180.0000 1,1 53.9025,42.4783\nA8.5039,3.5433 180.0000 0,1 62.4064,46.0216\nZ\nM45.3983,35.5071\nL39.7301,35.5071\nL39.7301,22.7507\nL47.6219,22.7507\nM53.9286,31.9638\nL62.4060,31.9638\nL62.4060,39.0504\nL45.3983,39.0504\nL45.3983,31.9638\nL53.9286,31.9638\nZ\nM53.9022,28.4205\nL49.1358,18.7763\nL46.3405,20.1579\nL48.8523,25.2403\nL51.6477,23.8588\nM46.8813,14.2146\nL49.1358,18.7763\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"48.2628\" y=\"35.4331\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"18.0972\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "qfa-n",
    "name": "QFA N",
    "category": "breaker",
    "master_id": null,
    "base_id": null,
    "shape_id": 56,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "QFA N (VSS master #56)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 20.31,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "AFD",
      "QFA"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 735.4,
        "y_mm": -534.3,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 740.4,
        "y_mm": -538.05,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 735.41,
        "y_mm": -538.01,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 732.92,
        "y_mm": -536.76,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 733.72,
        "y_mm": -542.66,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"2046.217 -1559.071 61.584 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1105\" >\n<path d=\" \nM2084.5984,-1514.5512\nL2084.5984,-1528.7244\nM2084.5984,-1557.0709\nL2084.5984,-1542.8976\nM2098.7717,-1514.5512\nL2098.7717,-1525.1811\nM2098.7717,-1557.0709\nL2098.7717,-1525.1811\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1106\" >\n<path d=\" \nM2084.6246,-1525.0674\nL2105.8007,-1525.0674\nL2105.8007,-1517.9808\nL2077.5690,-1517.9808\nL2077.5690,-1525.0674\nL2084.6246,-1525.0674\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM2077.5690,-1521.5241\nL2070.4260,-1521.5241\nL2070.4260,-1534.2804\nL2078.3179,-1534.2804\nM2084.6246,-1525.0674\nL2105.8007,-1525.0674\nL2105.8007,-1517.9808\nL2077.5690,-1517.9808\nL2077.5690,-1525.0674\nL2084.6246,-1525.0674\nZ\nM2084.5982,-1528.6107\nL2079.8318,-1538.2548\nL2077.0364,-1536.8732\nL2079.5483,-1531.7908\nL2082.3436,-1533.1724\nM2077.5772,-1542.8164\nL2079.8318,-1538.2548\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"2086.0451\" y=\"-1521.6378\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"2048.2167\" y=\"-1535.8110\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQFA</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "afd-n",
    "name": "AFD N",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 57,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "AFD N (VSS master #57)",
    "width_mm": 25.4,
    "height_mm": 20.0,
    "aspect_ratio": 1.27,
    "bbox_mm": {
      "w": 20.11,
      "h": 20.0
    },
    "paths": 3,
    "texts": [
      "AFD",
      "AFD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 19.01,
        "y_mm": 20.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 24.02,
        "y_mm": 11.25,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 18.22,
        "y_mm": 8.43,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 19.03,
        "y_mm": 11.3,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 16.53,
        "y_mm": 16.23,
        "source": "geometry"
      },
      {
        "id": "p6",
        "x_mm": 16.53,
        "y_mm": 12.54,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"16.097 -2.000 61.008 60.694\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1107\" >\n<path d=\" \nM53.9028,56.6944\nL53.9028,28.3465\nM53.9028,0.0000\nL53.9028,14.1732\nM68.0760,56.6944\nL68.0760,31.8898\nM68.0760,0.0000\nL68.0760,31.8898\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1108\" >\n<path d=\" \nM51.6480,23.9121\nL48.8527,25.2936\nL46.3408,20.2112\nL49.1361,18.8297\nL53.9025,28.4738\nZ\nM53.9290,32.0171\nL46.8733,32.0171\nL46.8733,39.1036\nL75.1050,39.1036\nL75.1050,32.0171\nL53.9290,32.0171\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM46.8733,46.0213\nA14.2859,3.5433 0.0000 0,1 61.1592,42.4780\nA14.2859,3.5433 0.0000 1,1 46.8733,46.0213\nZ\nM39.7304,35.4481\nL39.7304,46.0213\nL46.8733,46.0213\nM49.1361,18.8297\nL46.8816,14.2680\nM51.6480,23.9121\nL48.8527,25.2936\nL46.3408,20.2112\nL49.1361,18.8297\nL53.9025,28.4738\nM53.9290,32.0171\nL46.8733,32.0171\nL46.8733,39.1036\nL75.1050,39.1036\nL75.1050,32.0171\nL53.9290,32.0171\nZ\nM47.6222,22.8040\nL39.7304,22.8040\nL39.7304,35.5603\nL46.8733,35.5603\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"55.3494\" y=\"35.4331\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"18.0972\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "asd",
    "name": "ASD",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 58,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "ASD (VSS master #58)",
    "width_mm": 25.4,
    "height_mm": 20.0,
    "aspect_ratio": 1.27,
    "bbox_mm": {
      "w": 15.63,
      "h": 20.0
    },
    "paths": 3,
    "texts": [
      "AFD",
      "ASD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 735.4,
        "y_mm": -529.3,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 735.4,
        "y_mm": -544.3,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 735.41,
        "y_mm": -538.02,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 730.4,
        "y_mm": -536.79,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 732.9,
        "y_mm": -544.3,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"2046.793 -1559.071 48.309 60.693\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1109\" >\n<path d=\" \nM2084.5984,-1500.3780\nL2084.5984,-1528.7244\nM2084.5984,-1557.0709\nL2084.5984,-1542.8976\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1110\" >\n<path d=\" \nM2084.6243,-1525.1070\nL2093.1017,-1525.1070\nL2093.1017,-1518.0204\nL2076.0939,-1518.0204\nL2076.0939,-1525.1070\nL2084.6243,-1525.1070\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM2070.4255,-1521.6226\nL2070.4255,-1511.0493\nL2076.0942,-1511.0493\nM2093.1021,-1511.0493\nA8.5039,3.5433 180.0000 1,1 2084.5981,-1514.5926\nA8.5039,3.5433 180.0000 0,1 2093.1021,-1511.0493\nZ\nM2076.0939,-1521.5637\nL2070.4258,-1521.5637\nL2070.4258,-1535.7862\nL2080.6299,-1535.7862\nM2084.6243,-1525.1070\nL2093.1017,-1525.1070\nL2093.1017,-1518.0204\nL2076.0939,-1518.0204\nL2076.0939,-1525.1070\nL2084.6243,-1525.1070\nZ\nM2084.5979,-1528.6503\nL2082.3433,-1533.2121\nL2077.5118,-1542.8962\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"2078.9584\" y=\"-1521.6378\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"2048.7929\" y=\"-1535.8110\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nASD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "asd-n",
    "name": "ASD N",
    "category": "rcbo",
    "master_id": null,
    "base_id": null,
    "shape_id": 59,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "ASD N (VSS master #59)",
    "width_mm": 25.4,
    "height_mm": 20.0,
    "aspect_ratio": 1.27,
    "bbox_mm": {
      "w": 20.11,
      "h": 20.0
    },
    "paths": 3,
    "texts": [
      "AFD",
      "ASD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 19.01,
        "y_mm": 20.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 24.02,
        "y_mm": 11.25,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 19.03,
        "y_mm": 11.3,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 16.53,
        "y_mm": 16.23,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 16.53,
        "y_mm": 12.54,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"16.097 -2.000 61.008 60.693\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1111\" >\n<path d=\" \nM53.9028,56.6929\nL53.9028,28.3465\nM53.9028,0.0000\nL53.9028,14.1732\nM68.0760,56.6929\nL68.0760,31.8898\nM68.0760,0.0000\nL68.0760,31.8898\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1112\" >\n<path d=\" \nM53.9290,32.0171\nL46.8733,32.0171\nL46.8733,39.1036\nL75.1050,39.1036\nL75.1050,32.0171\nL53.9290,32.0171\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM46.8733,46.0213\nA14.2859,3.5433 0.0000 0,1 61.1592,42.4780\nA14.2859,3.5433 0.0000 1,1 46.8733,46.0213\nZ\nM39.7304,35.4481\nL39.7304,46.0213\nL46.8733,46.0213\nM46.8801,14.2679\nL53.9025,28.4738\nM53.9290,32.0171\nL46.8733,32.0171\nL46.8733,39.1036\nL75.1050,39.1036\nL75.1050,32.0171\nL53.9290,32.0171\nZ\nM49.9346,21.2848\nL39.7304,21.2848\nL39.7304,35.5603\nL46.8733,35.5603\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"55.3494\" y=\"35.4331\">\n<tspan font-family=\"Calibri\" font-size=\"6.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nAFD</tspan>\n</text>\n<text x=\"18.0972\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nASD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "no",
    "name": "NO",
    "category": "contact",
    "master_id": null,
    "base_id": null,
    "shape_id": 60,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "NO (VSS master #60)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 9.91,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "NO"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 12.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 9.52,
        "y_mm": 5.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"3.919 -2.000 32.096 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1113\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,28.3465\nM34.0157,0.0000\nL34.0157,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM34.0157,28.3628\nL26.9949,14.1570\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"5.9193\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nNO</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "nc",
    "name": "NC",
    "category": "contact",
    "master_id": null,
    "base_id": null,
    "shape_id": 61,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "NC (VSS master #61)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 10.96,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "NC"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 14.5,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 12.0,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"8.043 -2.000 35.059 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1114\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,28.3465\nM34.0157,0.0000\nL34.0157,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM41.1024,14.1725\nL34.0158,14.1725\nM40.0394,12.4009\nL34.0158,28.3458\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"10.0432\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nNC</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "q-переключатель",
    "name": "Q переключатель",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 62,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Q переключатель (VSS master #62)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 10.17,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "Q"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 13.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.5,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 13.5,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 13.0,
        "y_mm": 4.37,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"13.102 -2.000 32.835 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1115\" >\n<path d=\" \nM36.8504,42.5197\nL36.8504,29.7638\nM29.7638,0.0000\nL29.7638,14.1732\nM43.9370,0.0000\nL43.9370,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM38.2677,28.3465\nA1.4173,1.4173 180.0000 0,1 36.8504,29.7638\nA1.4173,1.4173 180.0000 1,1 38.2677,28.3465\nZ\nM36.8504,26.6457\nL36.8504,12.4015\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"15.1016\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQ</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "q-n-переключатель",
    "name": "Q+N переключатель",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 63,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Q+N переключатель (VSS master #63)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 20.17,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "Q"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 7.35,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 14.85,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 17.35,
        "y_mm": 9.4,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 7.85,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.910 -2.000 61.182 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1116\" >\n<path d=\" \nM20.8385,42.5197\nL20.8385,29.7638\nM13.7519,0.0000\nL13.7519,14.1732\nM27.9251,0.0000\nL27.9251,14.1732\nM49.1849,42.5197\nL49.1849,29.7638\nM56.2715,0.0000\nL56.2715,14.1732\nM42.0983,0.0000\nL42.0983,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM49.1849,26.6457\nL49.1849,12.4015\nM50.6023,28.3465\nA1.4173,1.4173 180.0000 0,1 49.1849,29.7638\nA1.4173,1.4173 180.0000 1,1 50.6023,28.3465\nZ\nM48.9723,19.8425\nL21.0511,19.8425\nM48.9723,22.6772\nL21.0511,22.6772\nM20.8385,26.6457\nL20.8385,12.4015\nM22.2558,28.3465\nA1.4173,1.4173 180.0000 0,1 20.8385,29.7638\nA1.4173,1.4173 180.0000 1,1 22.2558,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-0.9103\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQ</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "no-c-nc",
    "name": "NO,C,NC",
    "category": "contact",
    "master_id": null,
    "base_id": null,
    "shape_id": 64,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "NO,C,NC (VSS master #64)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 19.71,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "NO,C,NC"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 15.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 10.0,
        "y_mm": 0.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 12.5,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 15.0,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-15.355 -2.000 59.875 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1117\" >\n<path d=\" \nM42.5197,42.5197\nL42.5197,28.3465\nM42.5197,0.0000\nL42.5197,14.1732\nM28.3465,14.1732\nL28.3465,0.0000\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM35.4331,14.1732\nL28.3465,14.1732\nM32.4767,12.2743\nL42.5197,28.3464\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-13.3549\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nNO,C,NC</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "q-n-на-2-положения",
    "name": "Q+N на 2 положения",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 65,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Q+N на 2 положения (VSS master #65)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 17.67,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "Q"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 10.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 16.46,
        "y_mm": 4.33,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 5.0,
        "y_mm": 5.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"4.598 -2.000 54.095 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1118\" >\n<path d=\" \nM28.3465,42.5197\nL28.3465,28.3465\nM14.1732,0.0000\nL14.1732,14.1732\nM28.3465,0.0000\nL28.3465,14.1732\nM56.6929,42.5197\nL56.6929,28.3465\nM56.6929,0.0000\nL56.6929,14.1732\nM42.5197,0.0000\nL42.5197,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM46.6500,12.2743\nL56.6930,28.3465\nM49.6064,14.1733\nL42.5198,14.1733\nM53.0080,22.6772\nL24.9449,22.6772\nM51.3781,19.8425\nL23.1732,19.8425\nM18.3034,12.2743\nL28.3465,28.3465\nM21.2599,14.1733\nL14.1732,14.1733\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"6.5977\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nQ</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "sb",
    "name": "SB",
    "category": "contact",
    "master_id": null,
    "base_id": null,
    "shape_id": 66,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "SB (VSS master #66)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 11.34,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "SB"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 9.5,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 8.25,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-0.125 -2.000 36.141 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1119\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,28.3465\nM34.0157,0.0000\nL34.0157,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM26.9291,14.1732\nL34.0157,28.3464\nM19.8425,23.6220\nL31.6063,23.6220\nM19.8425,18.8976\nL29.0551,18.8976\nM23.3858,14.1732\nL19.8425,14.1732\nL19.8425,28.3464\nL23.3858,28.3464\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"1.8746\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nSB</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "kt",
    "name": "KT",
    "category": "contactor",
    "master_id": null,
    "base_id": null,
    "shape_id": 67,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "KT (VSS master #67)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 13.35,
      "h": 15.0
    },
    "paths": 2,
    "texts": [
      "KT"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 12.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 5.19,
        "y_mm": 7.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-5.829 -2.000 41.845 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1120\" >\n<path d=\" \nM34.0157,42.5197\nL34.0157,28.3465\nM34.0157,0.0000\nL34.0157,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM34.0155,28.3465\nL34.0158,28.3465\nL26.9938,14.1412\nM19.8425,26.9291\nA5.6693,5.6693 0.0000 1,1 19.8425,15.5906\nM31.1827,22.6772\nL14.6976,22.6772\nM29.7646,19.8425\nL14.6976,19.8425\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"-3.8288\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nKT</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "kk",
    "name": "KK",
    "category": "contactor",
    "master_id": null,
    "base_id": null,
    "shape_id": 68,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "KK (VSS master #68)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 16.46,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "KK"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 11.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 11.0,
        "y_mm": 5.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 6.0,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-3.317 -2.000 50.671 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1121\" >\n<path d=\" \nM31.1811,42.5197\nL31.1811,28.3465\nM31.1811,0.0000\nL31.1811,14.1732\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1122\" >\n<path d=\" \nM17.0079,28.3465\nL17.0079,14.1732\nL45.3543,14.1732\nL45.3543,28.3465\nL17.0079,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM31.1811,14.1732\nL31.1811,17.7165\nL38.2677,17.7165\nL38.2677,24.8031\nL31.1811,24.8031\nL31.1811,28.3465\nM17.0079,28.3465\nL17.0079,14.1732\nL45.3543,14.1732\nL45.3543,28.3465\nL17.0079,28.3465\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"-1.3166\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nKK</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "pe",
    "name": "PE",
    "category": "bus",
    "master_id": null,
    "base_id": null,
    "shape_id": 69,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "PE (VSS master #69)",
    "width_mm": 25.4,
    "height_mm": 10.0,
    "aspect_ratio": 2.54,
    "bbox_mm": {
      "w": 11.09,
      "h": 12.0
    },
    "paths": 2,
    "texts": [
      "PE"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 13.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 14.25,
        "y_mm": 12.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 9.25,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"14.033 -2.000 35.447 38.016\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1123\" >\n<path d=\" \nM36.8504,28.3465\nZ\nM36.8504,0.0000\nL36.8504,28.3465\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM40.3937,34.0157\nL33.3071,34.0157\nM43.9370,31.1811\nL29.7638,31.1811\nM47.4803,28.3465\nL26.2205,28.3465\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"16.0332\" y=\"16.2807\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nPE</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "m",
    "name": "M",
    "category": "machine",
    "master_id": null,
    "base_id": null,
    "shape_id": 70,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "M (VSS master #70)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 17.81,
      "h": 15.0
    },
    "paths": 3,
    "texts": [
      "M",
      "M"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 13.0,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 18.0,
        "y_mm": 2.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-1.476 -2.000 54.499 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1124\" >\n<path d=\" \nM36.8504,42.5197\nZ\nM36.8504,0.0000\nZ\nM22.6772,5.6693\nZ\nM51.0236,5.6693\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1125\" >\n<path d=\" \nM36.8504,0.0000\nA21.2598,21.2598 90.0000 1,1 15.5906,21.2598\nA21.2598,21.2598 90.0000 0,1 36.8504,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM36.8504,0.0000\nA21.2598,21.2598 90.0000 1,1 15.5906,21.2598\nA21.2598,21.2598 90.0000 0,1 36.8504,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"31.4433\" y=\"14.1732\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nM</tspan>\n</text>\n<text x=\"0.5244\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nM</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "g",
    "name": "G",
    "category": "machine",
    "master_id": null,
    "base_id": null,
    "shape_id": 71,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "G (VSS master #71)",
    "width_mm": 25.4,
    "height_mm": 15.0,
    "aspect_ratio": 1.693,
    "bbox_mm": {
      "w": 17.02,
      "h": 15.0
    },
    "paths": 4,
    "texts": [
      "G"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.5,
        "y_mm": 15.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 17.5,
        "y_mm": 2.0,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 8.5,
        "y_mm": 8.08,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 14.95,
        "y_mm": 10.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-0.652 -2.000 52.258 46.520\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1126\" >\n<path d=\" \nM35.4331,42.5197\nZ\nM35.4331,0.0000\nZ\nM21.2598,5.6693\nZ\nM49.6063,5.6693\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1127\" >\n<path d=\" \nM35.4331,0.0000\nA21.2598,21.2598 90.0000 1,1 14.1732,21.2598\nA21.2598,21.2598 90.0000 0,1 35.4331,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM35.4331,0.0000\nA21.2598,21.2598 90.0000 1,1 14.1732,21.2598\nA21.2598,21.2598 90.0000 0,1 35.4331,0.0000\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"34.3009\" y=\"14.1732\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<path d=\" \nM24.0945,22.8942\nC24.0945,22.8942 28.4912,14.1732 35.4331,21.2593\nC42.3750,28.3465 46.7717,19.9091 46.7717,19.9091\" \nstyle=\"stroke-width: 0.7500; stroke: #1d191c; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"1.3483\" y=\"21.2598\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nG</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "r",
    "name": "R",
    "category": "passive",
    "master_id": null,
    "base_id": null,
    "shape_id": 72,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "R (VSS master #72)",
    "width_mm": 25.4,
    "height_mm": 10.0,
    "aspect_ratio": 2.54,
    "bbox_mm": {
      "w": 6.96,
      "h": 10.0
    },
    "paths": 3,
    "texts": [
      "R"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 12.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 12.0,
        "y_mm": 1.25,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 10.75,
        "y_mm": 8.75,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"15.818 -2.000 23.741 32.346\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1128\" >\n<path d=\" \nM34.0157,28.3465\nL34.0157,24.8031\nM34.0157,0.0000\nL34.0157,3.5433\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1129\" >\n<path d=\" \nM30.4724,24.8031\nL30.4724,3.5433\nL37.5591,3.5433\nL37.5591,24.8031\nL30.4724,24.8031\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM30.4724,24.8031\nL30.4724,3.5433\nL37.5591,3.5433\nL37.5591,24.8031\nL30.4724,24.8031\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"17.8178\" y=\"14.1732\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nR</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "c",
    "name": "C",
    "category": "passive",
    "master_id": null,
    "base_id": null,
    "shape_id": 73,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "C (VSS master #73)",
    "width_mm": 25.4,
    "height_mm": 10.0,
    "aspect_ratio": 2.54,
    "bbox_mm": {
      "w": 9.18,
      "h": 10.0
    },
    "paths": 2,
    "texts": [
      "C"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 11.0,
        "y_mm": 10.0,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 11.0,
        "y_mm": 4.5,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 13.5,
        "y_mm": 4.5,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 8.5,
        "y_mm": 5.5,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"10.246 -2.000 30.021 32.346\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1130\" >\n<path d=\" \nM31.1811,28.3465\nL31.1811,15.5906\nM31.1811,0.0000\nL31.1811,12.7559\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<path d=\" \nM38.2677,12.7559\nL24.0945,12.7559\nM38.2677,15.5905\nL24.0945,15.5905\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"12.2463\" y=\"14.1732\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nC</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "vd",
    "name": "VD",
    "category": "passive",
    "master_id": null,
    "base_id": null,
    "shape_id": 74,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "VD (VSS master #74)",
    "width_mm": 10.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.394,
    "bbox_mm": {
      "w": 10.0,
      "h": 7.62
    },
    "paths": 3,
    "texts": [
      "VD"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 13.4,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 5.0,
        "y_mm": 13.4,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 7.5,
        "y_mm": 13.4,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 7.5,
        "y_mm": 15.9,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 21.479 32.346 25.592\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1131\" >\n<path d=\" \nM0.0000,37.9843\nL14.1732,37.9843\nM28.3465,37.9843\nL14.1732,37.9843\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1132\" >\n<path d=\" \nM21.2598,37.9843\nL7.0866,45.0709\nL7.0866,30.8976\nL21.2598,37.9843\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM21.2598,37.9843\nL7.0866,45.0709\nL7.0866,30.8976\nL21.2598,37.9843\nZ\nM21.2598,30.8976\nL21.2598,45.0709\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"7.1280\" y=\"23.4785\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nVD</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "u",
    "name": "U",
    "category": "passive",
    "master_id": null,
    "base_id": null,
    "shape_id": 75,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "U (VSS master #75)",
    "width_mm": 20.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.787,
    "bbox_mm": {
      "w": 20.0,
      "h": 13.62
    },
    "paths": 4,
    "texts": [
      "U"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 13.4,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.0,
        "y_mm": 13.4,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 5.0,
        "y_mm": 18.4,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 15.0,
        "y_mm": 8.4,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 6.78,
        "y_mm": 9.96,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 11.557 60.693 42.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1133\" >\n<path d=\" \nM0.0000,37.9843\nL14.1732,37.9843\nM56.6929,37.9843\nL42.5197,37.9843\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1134\" >\n<path d=\" \nM14.1732,52.1575\nL42.5197,52.1575\nL42.5197,23.8110\nL14.1732,23.8110\nL14.1732,52.1575\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM14.1732,52.1575\nL42.5197,52.1575\nL42.5197,23.8110\nL14.1732,23.8110\nL14.1732,52.1575\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM42.5197,23.8110\nL14.1732,52.1575\nM35.1496,46.4882\nL32.8819,46.4882\nM39.6850,46.4882\nL37.4173,46.4882\nM30.6142,46.4882\nL28.3465,46.4882\nM39.6850,43.6535\nL28.3465,43.6535\nM28.3465,30.3897\nC28.3465,30.3897 26.1481,33.5623 22.6772,30.8974\nC19.2062,28.2330 17.0079,31.5122 17.0079,31.5122\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"24.0063\" y=\"13.5572\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nU</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "u1",
    "name": "U1",
    "category": "passive",
    "master_id": null,
    "base_id": null,
    "shape_id": 76,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "U1 (VSS master #76)",
    "width_mm": 20.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.787,
    "bbox_mm": {
      "w": 20.0,
      "h": 13.62
    },
    "paths": 4,
    "texts": [
      "U1"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.01,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.0,
        "y_mm": 12.01,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 5.0,
        "y_mm": 17.01,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 14.0,
        "y_mm": 14.33,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 7.625 60.693 42.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1135\" >\n<path d=\" \nM0.0000,34.0523\nL14.1732,34.0523\nM56.6929,34.0523\nL42.5197,34.0523\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1136\" >\n<path d=\" \nM14.1732,48.2256\nL42.5197,48.2256\nL42.5197,19.8791\nL14.1732,19.8791\nL14.1732,48.2256\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM14.1732,48.2256\nL42.5197,48.2256\nL42.5197,19.8791\nL14.1732,19.8791\nL14.1732,48.2256\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM39.6850,40.6310\nC39.6850,40.6310 37.4867,43.8036 34.0157,41.1387\nC30.5448,38.4743 28.3464,41.7535 28.3464,41.7535\nM28.3464,26.4578\nC28.3464,26.4578 26.1481,29.6303 22.6771,26.9655\nC19.2062,24.3011 17.0078,27.5802 17.0078,27.5802\nM42.5197,19.8791\nL14.1732,48.2256\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"21.4722\" y=\"9.6253\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nU1</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "u2",
    "name": "U2",
    "category": "passive",
    "master_id": null,
    "base_id": null,
    "shape_id": 77,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "U2 (VSS master #77)",
    "width_mm": 20.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.787,
    "bbox_mm": {
      "w": 20.0,
      "h": 13.62
    },
    "paths": 4,
    "texts": [
      "U2"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.9,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.0,
        "y_mm": 12.9,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 5.0,
        "y_mm": 17.9,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 14.0,
        "y_mm": 15.22,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 6.0,
        "y_mm": 9.9,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 10.140 60.693 42.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1137\" >\n<path d=\" \nM0.0000,36.5669\nL14.1732,36.5669\nM56.6929,36.5669\nL42.5197,36.5669\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1138\" >\n<path d=\" \nM14.1732,50.7402\nL42.5197,50.7402\nL42.5197,22.3937\nL14.1732,22.3937\nL14.1732,50.7402\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM14.1732,50.7402\nL42.5197,50.7402\nL42.5197,22.3937\nL14.1732,22.3937\nL14.1732,50.7402\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM39.6850,43.1456\nC39.6850,43.1456 37.4866,46.3182 34.0157,43.6533\nC30.5448,40.9889 28.3465,44.2680 28.3465,44.2680\nM42.5196,22.3937\nL14.1733,50.7401\nM23.8111,30.8976\nL21.5434,30.8976\nM28.3465,30.8976\nL26.0788,30.8976\nM19.2757,30.8976\nL17.0080,30.8976\nM28.3465,28.0630\nL17.0080,28.0630\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"21.4722\" y=\"12.1399\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nU2</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "u3",
    "name": "U3",
    "category": "passive",
    "master_id": null,
    "base_id": null,
    "shape_id": 78,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "U3 (VSS master #78)",
    "width_mm": 20.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.787,
    "bbox_mm": {
      "w": 20.0,
      "h": 13.62
    },
    "paths": 4,
    "texts": [
      "U3"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 12.9,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 15.0,
        "y_mm": 12.9,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 5.0,
        "y_mm": 17.9,
        "source": "geometry"
      },
      {
        "id": "p4",
        "x_mm": 15.0,
        "y_mm": 7.9,
        "source": "geometry"
      },
      {
        "id": "p5",
        "x_mm": 6.0,
        "y_mm": 9.9,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 10.140 60.693 42.600\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1139\" >\n<path d=\" \nM0.0000,36.5669\nL14.1732,36.5669\nM56.6929,36.5669\nL42.5197,36.5669\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1140\" >\n<path d=\" \nM14.1732,50.7402\nL42.5197,50.7402\nL42.5197,22.3937\nL14.1732,22.3937\nL14.1732,50.7402\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM14.1732,50.7402\nL42.5197,50.7402\nL42.5197,22.3937\nL14.1732,22.3937\nL14.1732,50.7402\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM42.5198,22.3937\nL14.1733,50.7402\nM35.1497,45.0709\nL32.8820,45.0709\nM39.6852,45.0709\nL37.4174,45.0709\nM30.6143,45.0709\nL28.3465,45.0709\nM39.6852,42.2362\nL28.3465,42.2362\nM23.8111,30.8976\nL21.5434,30.8976\nM28.3465,30.8976\nL26.0788,30.8976\nM19.2756,30.8976\nL17.0079,30.8976\nM28.3465,28.0630\nL17.0079,28.0630\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"21.4722\" y=\"12.1399\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nU3</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "блокировка-механическая",
    "name": "Блокировка механическая",
    "category": "switch",
    "master_id": null,
    "base_id": null,
    "shape_id": 79,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Блокировка механическая (VSS master #79)",
    "width_mm": 15.0,
    "height_mm": 25.4,
    "aspect_ratio": 0.591,
    "bbox_mm": {
      "w": 15.0,
      "h": 5.42
    },
    "paths": 3,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 1.7,
        "y_mm": 13.4,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 9.2,
        "y_mm": 13.4,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 10.7,
        "y_mm": 12.1,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"2.809 24.313 46.520 19.354\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1141\" >\n<path d=\" \nM4.8088,37.9843\nL26.0686,37.9843\nM47.3285,37.9843\nL26.0686,37.9843\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 4.5000, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<g id=\"Layer1142\" >\n<path d=\" \nM30.3206,34.3019\nL21.8166,34.3019\nL26.0686,41.6666\nL30.3206,34.3019\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM30.3206,34.3019\nL21.8166,34.3019\nL26.0686,41.6666\nL30.3206,34.3019\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"24.9365\" y=\"26.3131\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "щит-шкаф",
    "name": "Щит/Шкаф",
    "category": "enclosure",
    "master_id": "22",
    "base_id": "{C0A85AB8-F889-45DC-A1DB-6038804214B9}",
    "shape_id": 80,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Щит/Шкаф (VSS master #80)",
    "width_mm": 70.0,
    "height_mm": 47.5,
    "aspect_ratio": 1.474,
    "bbox_mm": {
      "w": 70.0,
      "h": 47.5
    },
    "paths": 1,
    "texts": [
      "ЩЭ"
    ],
    "props": [
      {
        "key": "LabelTimVisio",
        "label": "Обозначение",
        "value": "ЩЭ"
      },
      {
        "key": "StickerTimVisioText",
        "label": "Текст перед номером",
        "value": "ЩЭ"
      },
      {
        "key": "NumberLabelTimVisio",
        "label": "Номер",
        "value": ""
      },
      {
        "key": "Mark",
        "label": "Марка",
        "value": ""
      },
      {
        "key": "Name",
        "label": "Наименование",
        "value": "0"
      },
      {
        "key": "Article",
        "label": "Артикул",
        "value": "0"
      }
    ],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 47.5,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 -2.000 202.425 138.646\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1143\" >\n<path d=\" \nM0.0000,134.6457\nL198.4252,134.6457\nL198.4252,0.0000\nL0.0000,0.0000\nL0.0000,134.6457\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 4.5000, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"6.8346\" y=\"14.1732\">\n<tspan font-family=\"Calibri\" font-size=\"12.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nЩЭ</tspan>\n</text>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "провод-n",
    "name": "Провод N",
    "category": "bus",
    "master_id": "20",
    "base_id": "{85CAECCA-852E-41E2-B776-F3738BA343C6}",
    "shape_id": 81,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Провод N (VSS master #81)",
    "width_mm": 25.4,
    "height_mm": 17.63,
    "aspect_ratio": 1.441,
    "bbox_mm": {
      "w": 5.0,
      "h": 22.5
    },
    "paths": 1,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 22.5,
        "y_mm": -5.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"24.636 -0.016 18.173 67.780\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><defs>\n<marker id=\"startMarker31\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM40.8088,1.9843\nL40.8088,51.9635\nL26.6355,65.7638\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker31); \"/></svg>",
    "errors": [
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "провод-pe",
    "name": "Провод PE",
    "category": "bus",
    "master_id": "21",
    "base_id": "{E49634F7-C04A-4A27-8D1C-52CC03EA9140}",
    "shape_id": 82,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Провод PE (VSS master #82)",
    "width_mm": 25.4,
    "height_mm": 17.63,
    "aspect_ratio": 1.441,
    "bbox_mm": {
      "w": 10.0,
      "h": 22.5
    },
    "paths": 1,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 0.0,
        "y_mm": 0.0,
        "source": "visio-master"
      },
      {
        "id": "out",
        "x_mm": 22.5,
        "y_mm": -10.0,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"10.462 -0.016 32.346 67.780\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><defs>\n<marker id=\"startMarker32\"  markerUnits=\"strokeWidth\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"6\"\n viewBox=\"0 0 10 10\" refX=\"9\" refY=\"5\">\n<polyline points=\"10,0 0,5 10,10 9,5\" fill=\"solid\" />\n</marker>\n</defs>\n<path d=\" \nM40.8088,1.9843\nL40.8088,51.9635\nL12.4623,65.7638\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: 4.5000, 2.2500, 0.7500, 2.2500; stroke-linecap: round; stroke-linejoin: round; fill: none; marker-start: url(#startMarker32); \"/></svg>",
    "errors": [
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "боковик",
    "name": "Боковик",
    "category": "frame",
    "master_id": "2",
    "base_id": "{AF093734-59A2-4247-B552-9014091A0B57}",
    "shape_id": 83,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Боковик (VSS master #83)",
    "width_mm": 37.5,
    "height_mm": 195.0,
    "aspect_ratio": 0.192,
    "bbox_mm": {
      "w": 46.6,
      "h": 195.0
    },
    "paths": 3,
    "texts": [
      "№ группы",
      "Условное",
      "обозначение",
      "Фаза",
      "P",
      "н, кВт",
      "I",
      "н",
      ", А",
      "Наименование",
      "Электроприемник",
      "Марка и сечение кабеля, провода",
      "Тип аппарата защиты Ток расцепителя, А",
      "Шины 400/230В Вводные аппараты",
      "Данные питающей  сети"
    ],
    "props": [
      {
        "key": "OutSetCell_1",
        "label": "1",
        "value": "Данные питающей  сети"
      },
      {
        "key": "OutSetCell_2",
        "label": "2",
        "value": "Шины 400/230В Вводные аппараты"
      },
      {
        "key": "OutSetCell_3",
        "label": "3",
        "value": "Тип аппарата защиты Ток расцепителя, А"
      },
      {
        "key": "OutSetCell_4",
        "label": "4",
        "value": "Марка и сечение кабеля, провода"
      }
    ],
    "connection_points": [
      {
        "id": "OutSet",
        "x_mm": 37.5,
        "y_mm": 31.25,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-22.999 -0.016 136.107 556.756\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1144\" >\n<path d=\" \nM4.8088,554.7402\nL4.8088,1.9843\nL111.1080,1.9843\nL111.1080,554.7402\nL4.8088,554.7402\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM4.8088,377.5748\nL111.1080,377.5748\nM4.8088,278.3622\nL111.1080,278.3622\nM4.8088,200.4094\nL111.1080,200.4094\nM4.8088,101.1969\nL111.1080,101.1969\nM4.8088,554.7402\nL4.8088,1.9843\nL111.1080,1.9843\nL111.1080,554.7402\nL4.8088,554.7402\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"41.0503\" y=\"413.0079\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n№ группы</tspan>\n</text>\n<text x=\"41.0503\" y=\"391.7480\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nУсловное</tspan>\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nобозначение</tspan>\n</text>\n<text x=\"41.0503\" y=\"427.1811\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nФаза</tspan>\n</text>\n<text x=\"41.0503\" y=\"441.3543\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nP</tspan>\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nн, кВт</tspan>\n</text>\n<text x=\"41.0503\" y=\"455.5276\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nI</tspan>\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nн</tspan>\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n, А</tspan>\n</text>\n<text x=\"37.1269\" y=\"508.6772\" transform=\"rotate(-90.0000, 70.3052, 508.6772)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nНаименование</tspan>\n</text>\n<text x=\"-20.9994\" y=\"466.1574\" transform=\"rotate(-90.0000, 18.9270, 466.1574)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nЭлектроприемник</tspan>\n</text>\n<text x=\"8.6030\" y=\"327.9685\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nМарка и сечение кабеля, провода</tspan>\n</text>\n<text x=\"8.6030\" y=\"239.3858\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nТип аппарата защиты Ток расцепителя, А</tspan>\n</text>\n<text x=\"8.6030\" y=\"150.8031\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nШины 400/230В Вводные аппараты</tspan>\n</text>\n<text x=\"8.6030\" y=\"51.5906\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nДанные питающей  сети</tspan>\n</text>\n<path d=\" \nM111.1080,462.6879\nL33.1553,462.6879\nM111.1080,448.5260\nL33.1553,448.5260\nM111.1080,434.3641\nL33.1553,434.3641\nM110.6918,420.2022\nL33.1553,420.2022\nM110.6918,406.0403\nL33.1553,406.0403\nM33.1553,377.7166\nL33.1553,554.7401\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/></svg>",
    "errors": []
  },
  {
    "id": "электроприемник",
    "name": "Электроприемник",
    "category": "load",
    "master_id": "4",
    "base_id": "{6D040A3C-BFBC-4831-98F2-0267991CB4A4}",
    "shape_id": 84,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Электроприемник (VSS master #84)",
    "width_mm": 25.0,
    "height_mm": 62.5,
    "aspect_ratio": 0.4,
    "bbox_mm": {
      "w": 30.0,
      "h": 62.5
    },
    "paths": 3,
    "texts": [],
    "props": [
      {
        "key": "UGO",
        "label": "Условное обозначение",
        "value": "0"
      },
      {
        "key": "NumberGroup",
        "label": "№ группы",
        "value": ""
      },
      {
        "key": "Phase",
        "label": "Фаза",
        "value": ""
      },
      {
        "key": "Power",
        "label": "Pн, кВт",
        "value": ""
      },
      {
        "key": "Current",
        "label": "Iн, A",
        "value": ""
      },
      {
        "key": "NameElecticReceiver",
        "label": "Наименование",
        "value": ""
      }
    ],
    "connection_points": [
      {
        "id": "in",
        "x_mm": 15.0,
        "y_mm": 62.5,
        "source": "visio-master"
      },
      {
        "id": "Row_2",
        "x_mm": 0.0,
        "y_mm": 31.25,
        "source": "visio-master"
      },
      {
        "id": "Row_3",
        "x_mm": 30.0,
        "y_mm": 31.25,
        "source": "visio-master"
      },
      {
        "id": "Row_4",
        "x_mm": 15.0,
        "y_mm": 57.5,
        "source": "visio-master"
      }
    ],
    "conn_source": "visio-master",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 -2.000 89.039 181.165\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1145\" >\n<path d=\" \nM0.0000,177.1654\nL85.0394,177.1654\nL85.0394,0.0000\nL0.0000,0.0000\nL0.0000,177.1654\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM0.0000,177.1654\nL85.0394,177.1654\nL85.0394,0.0000\nL0.0000,0.0000\nL0.0000,177.1654\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<path d=\" \nM85.0393,85.0393\nL0.0000,85.0393\nM85.0393,70.8661\nL0.0000,70.8661\nM85.0393,56.6929\nL0.0000,56.6929\nM84.8122,42.5197\nL0.2271,42.5197\nM84.8122,28.3464\nL0.2271,28.3464\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n<text x=\"0.0000\" y=\"77.9527\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"0.0000\" y=\"63.7795\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"0.0000\" y=\"49.6063\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"0.0000\" y=\"35.4330\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"0.4567\" y=\"131.1024\" transform=\"rotate(-90.0000, 42.5197, 131.1024)\" >\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text></svg>",
    "errors": [
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "боковик-2",
    "name": "Боковик 2",
    "category": "frame",
    "master_id": null,
    "base_id": null,
    "shape_id": 85,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Боковик 2 (VSS master #85)",
    "width_mm": 37.5,
    "height_mm": 218.75,
    "aspect_ratio": 0.171,
    "bbox_mm": {
      "w": 74.02,
      "h": 218.75
    },
    "paths": 2,
    "texts": [
      "Аппарат отходящей",
      "линии на ВРУ здания",
      "Тип, номинальный",
      "ток(А), ток расцепителя(А)",
      "Устройство защитного",
      "Отключения: тип, номинальный ток нагрузки(А), номинальный отключающий дифференциальный ток(А)",
      "Аппараты ввода отходящих линий. Автоматический выключатель: тип, ток расцепителя(А)",
      "Промежуточные",
      "устройства",
      "Коммутирующие устройства: номер устройства, канала",
      "Клеммные модули отходящие линий",
      "Промежуточные",
      "устройства",
      "Обозначение участка сети, марка проводника, его сечение",
      "Условные обозначение",
      "Номер группы",
      "Номер фазы сети",
      "Установленная мощность, кВт",
      "Номинальный ток, А",
      "Наименование потребителя",
      "Наименование помещений",
      "Электроприемник",
      "Участок трассы",
      "Распределительный шкаф",
      "Данные питающей сети"
    ],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 722.7,
        "y_mm": -330.55,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 760.2,
        "y_mm": -481.55,
        "source": "geometry"
      },
      {
        "id": "p3",
        "x_mm": 732.65,
        "y_mm": -358.05,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"1943.063 -1559.071 213.835 624.079\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1146\" >\n<path d=\" \nM2048.5984,-936.9921\nL2048.5984,-1557.0709\nL2154.8976,-1557.0709\nL2154.8976,-936.9921\nL2048.5984,-936.9921\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM2154.8976,-1365.0236\nL2076.8032,-1365.0236\nM2154.8976,-1305.4961\nL2076.8032,-1305.4961\nM2154.8976,-1074.4725\nL2076.8032,-1074.4725\nM2154.8976,-1054.6300\nL2076.8032,-1054.6300\nM2154.8976,-1114.1575\nL2048.5984,-1114.1575\nM2154.8976,-1251.6378\nL2048.5984,-1251.6378\nM2154.8976,-1194.9449\nL2076.8032,-1194.9449\nM2154.8976,-1486.9134\nL2048.5984,-1486.9134\nM2154.8976,-1520.9292\nL2076.8032,-1520.9292\nM2154.8976,-956.8347\nL2076.8032,-956.8347\nM2048.5984,-936.9921\nL2048.5984,-1557.0709\nL2154.8976,-1557.0709\nL2154.8976,-936.9921\nL2048.5984,-936.9921\nZ\nM2076.8032,-1557.0709\nL2076.8032,-936.9921\nM2154.8976,-1413.2126\nL2076.8032,-1413.2126\nM2154.8976,-1339.5118\nL2076.8032,-1339.5118\nM2154.8976,-1094.3150\nL2076.8032,-1094.3150\nM2154.8976,-1034.7874\nL2076.8032,-1034.7874\nM2154.8976,-1014.9449\nL2076.8032,-1014.9449\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"2076.8032\" y=\"-1539.0000\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nАппарат отходящей</tspan>\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nлинии на ВРУ здания</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1503.9213\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nТип, номинальный</tspan>\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nток(А), ток расцепителя(А)</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1450.0630\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nУстройство защитного</tspan>\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nОтключения: тип, номинальный ток нагрузки(А), номинальный отключающий дифференциальный ток(А)</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1389.1181\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nАппараты ввода отходящих линий. Автоматический выключатель: тип, ток расцепителя(А)</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1352.2677\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nПромежуточные</tspan>\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nустройства</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1322.5040\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nКоммутирующие устройства: номер устройства, канала</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1223.2913\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nКлеммные модули отходящие линий</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1278.5669\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nПромежуточные</tspan>\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nустройства</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1154.5512\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nОбозначение участка сети, марка проводника, его сечение</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1104.2363\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nУсловные обозначение</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1084.3937\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nНомер группы</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1064.5512\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nНомер фазы сети</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1044.7087\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nУстановленная мощность, кВт</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-1024.8662\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nНоминальный ток, А</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-985.8898\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nНаименование потребителя</tspan>\n</text>\n<text x=\"2076.8032\" y=\"-946.9134\">\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nНаименование помещений</tspan>\n</text>\n<text x=\"1974.1181\" y=\"-1025.5748\" transform=\"rotate(-90.0000, 2062.7008, -1025.5748)\" >\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nЭлектроприемник</tspan>\n</text>\n<text x=\"1993.9606\" y=\"-1182.8977\" transform=\"rotate(-90.0000, 2062.7008, -1182.8977)\" >\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nУчасток трассы</tspan>\n</text>\n<text x=\"1945.0630\" y=\"-1369.2756\" transform=\"rotate(-90.0000, 2062.7008, -1369.2756)\" >\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nРаспределительный шкаф</tspan>\n</text>\n<text x=\"2027.6221\" y=\"-1521.9921\" transform=\"rotate(-90.0000, 2062.7008, -1521.9921)\" >\n<tspan font-family=\"Calibri\" font-size=\"7.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\nДанные питающей сети</tspan>\n</text></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)"
    ]
  },
  {
    "id": "электроприемник-2",
    "name": "Электроприемник 2",
    "category": "load",
    "master_id": null,
    "base_id": null,
    "shape_id": 86,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Электроприемник 2 (VSS master #86)",
    "width_mm": 30.0,
    "height_mm": 62.5,
    "aspect_ratio": 0.48,
    "bbox_mm": {
      "w": 30.0,
      "h": 62.5
    },
    "paths": 2,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 722.7,
        "y_mm": -486.8,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 752.7,
        "y_mm": -514.3,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"2046.598 -1559.071 89.039 181.165\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1147\" >\n<path d=\" \nM2048.5984,-1379.9055\nL2048.5984,-1557.0709\nL2133.6378,-1557.0709\nL2133.6378,-1379.9055\nL2048.5984,-1379.9055\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM2048.5984,-1379.9055\nL2048.5984,-1557.0709\nL2133.6378,-1557.0709\nL2133.6378,-1379.9055\nL2048.5984,-1379.9055\nZ\nM2048.5984,-1399.7480\nL2133.6377,-1399.7480\nM2048.5985,-1537.2284\nL2133.6377,-1537.2284\nM2048.5985,-1517.3858\nL2133.6377,-1517.3858\nM2048.5985,-1497.5433\nL2133.6377,-1497.5433\nM2048.5985,-1477.7008\nL2133.6377,-1477.7008\nM2048.5985,-1457.8583\nL2133.6377,-1457.8583\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g>\n<text x=\"2052.5984\" y=\"-1428.8031\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"2048.5984\" y=\"-1467.7795\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"2048.5984\" y=\"-1487.6221\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"2048.5984\" y=\"-1507.4646\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"2048.5984\" y=\"-1527.3071\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text>\n<text x=\"2052.5984\" y=\"-1389.8267\">\n<tspan font-family=\"Calibri\" font-size=\"10.0000\" fill=\"#000000\" fill-opacity=\"1.0000\" stroke-opacity=\"1.0000\" >\n</tspan>\n</text></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "боковик-3",
    "name": "Боковик 3",
    "category": "frame",
    "master_id": null,
    "base_id": null,
    "shape_id": 87,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Боковик 3 (VSS master #87)",
    "width_mm": 37.5,
    "height_mm": 195.0,
    "aspect_ratio": 0.192,
    "bbox_mm": {
      "w": 37.5,
      "h": 195.0
    },
    "paths": 2,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 195.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 -2.000 110.299 556.756\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1148\" >\n<path d=\" \nM0.0000,552.7559\nL106.2992,552.7559\nL106.2992,0.0000\nL0.0000,0.0000\nL0.0000,552.7559\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM0.0000,552.7559\nL106.2992,552.7559\nL106.2992,0.0000\nL0.0000,0.0000\nL0.0000,552.7559\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "электроприемник-3",
    "name": "Электроприемник 3",
    "category": "load",
    "master_id": null,
    "base_id": null,
    "shape_id": 88,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Электроприемник 3 (VSS master #88)",
    "width_mm": 30.0,
    "height_mm": 62.5,
    "aspect_ratio": 0.48,
    "bbox_mm": {
      "w": 30.0,
      "h": 62.5
    },
    "paths": 2,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 0.0,
        "y_mm": 62.5,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.000 -2.000 89.039 181.165\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><g id=\"Layer1149\" >\n<path d=\" \nM0.0000,177.1654\nL85.0394,177.1654\nL85.0394,0.0000\nL0.0000,0.0000\nL0.0000,177.1654\nZ\" \nstyle=\"stroke-width: 0.7500; stroke-linecap: round; stroke-linejoin: round; fill-rule: evenodd; fill: #ffffff; \"/>\n<path d=\" \nM0.0000,177.1654\nL85.0394,177.1654\nL85.0394,0.0000\nL0.0000,0.0000\nL0.0000,177.1654\nZ\" \nstyle=\"stroke-width: 0.7500; stroke: #000000; stroke-dasharray: none; stroke-linecap: round; stroke-linejoin: round; fill: none; \"/>\n</g></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "обновить",
    "name": "Обновить",
    "category": "service",
    "master_id": null,
    "base_id": null,
    "shape_id": 89,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Обновить (VSS master #89)",
    "width_mm": 30.8,
    "height_mm": 30.0,
    "aspect_ratio": 1.027,
    "bbox_mm": {
      "w": 30.96,
      "h": 30.95
    },
    "paths": 1,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 22.02,
        "y_mm": 4.69,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 3.69,
        "y_mm": 20.07,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-4.640 -4.752 91.753 91.730\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><path d=\" \nM62.4128,13.3046\nL67.1909,13.2647\nC52.5402,1.1514 30.8611,3.1243 18.6377,17.6835\nC17.6895,18.8081 16.0091,18.9511 14.8844,18.0029\nC13.7598,17.0547 13.6168,15.3743 14.5650,14.2496\nC14.6261,14.1769 14.6873,14.1044 14.7489,14.0323\nC29.0515,-2.7524 54.2527,-4.7645 71.0374,9.5380\nL71.0374,4.6801\nC71.0374,3.2099 72.2291,2.0181 73.6993,2.0181\nC75.1694,2.0181 76.3612,3.2099 76.3612,4.6801\nL76.3612,15.9665\nC76.3548,16.6865 76.0570,17.3731 75.5360,17.8698\nL75.3630,18.0029\nL75.2831,18.0694\nL75.0968,18.1892\nC74.6722,18.4757 74.1716,18.6286 73.6593,18.6284\nC73.5574,18.6350 73.4552,18.6350 73.3532,18.6284\nL62.4128,18.6284\nC60.9426,18.6284 59.7509,17.4367 59.7509,15.9665\nC59.7509,14.4964 60.9426,13.3046 62.4128,13.3046\nZ\nM85.0390,39.9636\nC85.1129,56.9611 74.3723,72.1253 58.3134,77.6962\nL62.4660,80.0520\nC63.7451,80.7871 64.1860,82.4197 63.4509,83.6988\nC62.7158,84.9778 61.0832,85.4188 59.8041,84.6837\nL49.9950,79.0804\nC49.9950,79.0804 49.9948,79.0804 49.9948,79.0802\nC48.7195,78.3489 48.2787,76.7222 49.0101,75.4469\nL54.6001,65.6377\nC55.3352,64.3587 56.9678,63.9177 58.2469,64.6528\nC59.5259,65.3879 59.9669,67.0206 59.2318,68.2996\nL56.8095,72.5321\nC56.9378,72.4860 57.0658,72.4393 57.1936,72.3917\nC75.1057,65.7272 84.2235,45.8039 77.5590,27.8919\nC77.0445,26.5137 77.7447,24.9792 79.1229,24.4647\nC80.5011,23.9501 82.0356,24.6504 82.5501,26.0286\nC84.2017,30.4887 85.0444,35.2076 85.0390,39.9636\nZ\nM39.3873,74.0893\nL39.3340,74.0094\nC40.8042,74.1271 41.9006,75.4141 41.7830,76.8843\nC41.6653,78.3545 40.3783,79.4509 38.9081,79.3333\nL38.4556,79.3333\nC19.2124,76.1422 5.1213,59.4696 5.1818,39.9636\nC5.1862,37.4445 5.4268,34.9313 5.9005,32.4571\nL1.8278,34.8128\nC1.7647,34.8530 1.6999,34.8904 1.6336,34.9250\nC0.3310,35.6065 -1.2775,35.1030 -1.9589,33.8003\nC-2.6404,32.4977 -2.1368,30.8892 -0.8341,30.2077\nL9.0149,24.5246\nC9.6271,24.1707 10.3550,24.0748 11.0380,24.2584\nC11.7173,24.4419 12.2962,24.8870 12.6484,25.4962\nL18.3050,35.2787\nC19.0401,36.5540 18.6020,38.1838 17.3267,38.9188\nC16.0514,39.6539 14.4216,39.2159 13.6866,37.9406\nL11.2509,33.7215\nL11.1444,33.7215\nC10.7445,35.7789 10.5307,37.8679 10.5056,39.9636\nC10.4570,56.8839 22.6918,71.3401 39.3873,74.0893\nZ\" \nstyle=\"fill-rule: evenodd; fill: #000000; \"/></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  },
  {
    "id": "скрыть-контекстное-меню",
    "name": "Скрыть контекстное меню",
    "category": "service",
    "master_id": null,
    "base_id": null,
    "shape_id": 90,
    "source_vss": "electricaldiagramTimVisio.vss",
    "source_master": "Скрыть контекстное меню (VSS master #90)",
    "width_mm": 15.48,
    "height_mm": 15.09,
    "aspect_ratio": 1.026,
    "bbox_mm": {
      "w": 15.61,
      "h": 15.09
    },
    "paths": 1,
    "texts": [],
    "props": [],
    "connection_points": [
      {
        "id": "p1",
        "x_mm": 8.27,
        "y_mm": 5.53,
        "source": "geometry"
      },
      {
        "id": "p2",
        "x_mm": 1.15,
        "y_mm": 9.0,
        "source": "geometry"
      }
    ],
    "conn_source": "geometry",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-2.226 -1.738 48.237 46.782\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid meet\"><path d=\" \nM23.4462,15.6780\nC20.8038,14.8243 17.9697,16.2744 17.1160,18.9168\nC16.9541,19.4182 16.8718,19.9420 16.8726,20.4691\nC16.8709,20.9920 16.9529,21.5118 17.1154,22.0088\nL23.4462,15.6780\nZ\nM29.5106,28.3456\nC33.0806,24.9159 33.8883,19.5099 31.4768,15.1864\nL32.2466,14.4166\nC35.0855,16.3060 37.6725,18.5488 39.9455,21.0909\nC37.7602,23.2111 34.0174,26.3913 29.5106,28.3456\nZ\nM21.9064,29.2339\nC20.6397,29.2364 19.3880,28.9594 18.2406,28.4226\nL21.2017,25.4615\nC21.4312,25.4944 21.6627,25.5122 21.8946,25.5148\nC24.6734,25.5115 26.9252,23.2597 26.9285,20.4809\nC26.9257,20.2491 26.9079,20.0176 26.8752,19.7880\nL29.8363,16.8269\nC31.8707,21.2121 29.9650,26.4163 25.5798,28.4507\nC24.4214,28.9881 23.1596,29.2655 21.8828,29.2636\nL21.9064,29.2339\nZ\nM34.7991,11.8641\nL43.8897,2.7735\nL41.3787,0.2624\nL1.1076,40.5335\nL3.6186,43.0446\nL14.4385,32.2247\nC16.8271,33.1222 19.3549,33.5932 21.9064,33.6164\nC31.6130,33.6164 39.8982,26.1959 43.1435,22.8380\nC44.0111,21.9287 44.0621,20.5144 43.2620,19.5452\nC40.7784,16.6361 37.9346,14.0549 34.7991,11.8641\nZ\nM9.3454,29.7788\nL11.9453,27.1789\nC8.9877,25.5099 6.2670,23.4524 3.8555,21.0613\nC5.1482,19.6338 6.5331,18.2925 8.0011,17.0460\nC9.7901,15.5109 11.7446,14.1801 13.8285,13.0781\nC10.4637,16.7421 10.0056,22.2193 12.7152,26.3913\nL14.3023,24.8041\nC11.9086,20.6004 13.3759,15.2522 17.5796,12.8585\nC20.2706,11.3262 23.5706,11.3286 26.2593,12.8649\nL29.9784,9.1458\nC27.4447,7.9799 24.6952,7.3566 21.9064,7.3158\nC12.1052,7.3158 3.7489,15.8320 0.5865,19.5452\nC-0.2261,20.5046 -0.1904,21.9207 0.6694,22.8380\nC3.2490,25.5170 6.1654,27.8502 9.3454,29.7788\nZ\" \nstyle=\"fill-rule: evenodd; fill: #000000; \"/></svg>",
    "errors": [
      "Точки подключения вычислены по геометрии (мастер отсутствует в Документ1.vsdx)",
      "Текстовые поля в мастере отсутствуют"
    ]
  }
];

export const SCHEMATIC_CATEGORIES: { key: string; label: string }[] = [
  {
    "key": "service",
    "label": "Служебные фигуры"
  },
  {
    "key": "bus",
    "label": "Шины и проводники"
  },
  {
    "key": "rcbo",
    "label": "Дифавтоматы (QFD)"
  },
  {
    "key": "rcd",
    "label": "УЗО (QD)"
  },
  {
    "key": "breaker",
    "label": "Автоматические выключатели (QF)"
  },
  {
    "key": "switch",
    "label": "Рубильники, разъединители, переключатели"
  },
  {
    "key": "meter",
    "label": "Приборы учёта и измерения"
  },
  {
    "key": "transformer",
    "label": "Трансформаторы"
  },
  {
    "key": "contactor",
    "label": "Контакторы, реле, катушки"
  },
  {
    "key": "contact",
    "label": "Контакты и кнопки"
  },
  {
    "key": "protection",
    "label": "Предохранители и защита"
  },
  {
    "key": "signal",
    "label": "Сигнальная арматура"
  },
  {
    "key": "machine",
    "label": "Машины и источники"
  },
  {
    "key": "passive",
    "label": "Пассивные элементы и преобразователи"
  },
  {
    "key": "load",
    "label": "Электроприёмники"
  },
  {
    "key": "enclosure",
    "label": "Щиты и шкафы"
  },
  {
    "key": "frame",
    "label": "Рамки, боковики, оформление"
  },
  {
    "key": "cable",
    "label": "Кабельные блоки"
  }
];
