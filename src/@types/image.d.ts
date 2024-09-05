declare interface ArcOptions {
  x: number;
  y: number;
  radius: number;
  image?: Canvas.Image;
  outLine: number;
  outLineColor?: string;
}

declare interface TextOptions {
  x: number;
  y: number;
  text: string;
  fonts: string[];
  fontSize: number;
  maxWidth: number;
  color: string;
  align: CanvasTextAlign;
  baseline: CanvasTextBaseline;
  strokeColor: string | null;
}

declare interface CertificateOptions {
  image: {
    data: Buffer;
    info: sharp.OutputInfo;
  };

  textConfig: TextOptions;
}
