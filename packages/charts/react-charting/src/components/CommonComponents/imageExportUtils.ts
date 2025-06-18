// Utility for image export logic
import { toImage as baseToImage } from '../../utilities/image-export-utils';
import type { IImageExportOptions } from '../../types/index';

export function useImageExport(chartRef: React.RefObject<any>, legendRef?: React.RefObject<any>, isRtl?: boolean) {
  return (opts?: IImageExportOptions): Promise<string> => {
    return baseToImage(
      chartRef.current?.chartContainer || chartRef.current?._rootElem || chartRef.current,
      legendRef?.current?.toSVG,
      isRtl,
      opts,
    );
  };
}
