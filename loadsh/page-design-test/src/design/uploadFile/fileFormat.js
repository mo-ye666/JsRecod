const fileTyleList = [
  { value: 1, label: '图片' },
  { value: 2, label: '视频' },
  { value: 3, label: '音频' },
  { value: 4, label: 'excel' },
  { value: 5, label: 'word' },
  { value: 6, label: 'pdf' },
  { value: 7, label: 'txt' },
  { value: 8, label: '压缩包' },
  { value: 9, label: '文件类型不限' }
]

const imageTyleList = [
  { label: 'png', value: '.png' },
  { label: 'jpeg', value: '.jpeg' },
  { label: 'jpg', value: '.jpg' },
  { label: 'gif', value: '.gif' },
  { label: 'svg', value: '.svg' },
  { label: 'psd', value: '.psd' },
  { label: 'webp', value: '.webp' },
  { label: 'bmp', value: '.bmp' },
  { label: 'pcx', value: '.pcx' },
  { label: 'tif', value: '.tif' },
  { label: 'tga', value: '.tga' },
  { label: 'exif', value: '.exif' },
  { label: 'fpx', value: '.fpx' },
  { label: 'raw', value: '.raw' },
  { label: 'wmf', value: '.wmf' },
  { label: 'flic', value: '.flic' },
  { label: 'emf', value: '.emf' },
  { label: 'ico', value: '.ico' },
  { label: '格式不限', value: 'image/*' }
]

const vedioTyleList = [
  { label: 'mp4', value: '.mp4' },
  { label: 'Ogg', value: '.ogg' },
  { label: 'WebM', value: '.webm' },
  { label: 'wmv', value: '.wmv' },
  { label: 'avi', value: '.avi' },
  { label: 'navi', value: '.navi' },
  { label: '3gp', value: '.3gp' },
  { label: 'rm', value: '.rm' },
  { label: 'rmvb', value: '.rmvb' },
  { label: 'flv', value: '.flv' },
  { label: 'f4v', value: '.f4v' },
  { label: 'mpeg', value: '.mpeg' },
  { label: 'asf', value: '.asf' },
  { label: 'mov', value: '.mov' },
  { label: '格式不限', value: 'video/*' }
]

const audioTypeList = [
  { label: 'CD', value: '.cd' },
  { label: 'WAVE', value: '.wave' },
  { label: 'aiff', value: '.aiff' },
  { label: 'mp3', value: '.mp3' },
  { label: 'wma', value: '.wma' },
  { label: 'OggVorbis', value: '.oggvorbis' },
  { label: 'AMR', value: '.amr' },
  { label: 'APE', value: '.ape' },
  { label: 'FLAC', value: '.flac' },
  { label: 'AAC', value: '.aac' },
  { label: '格式不限', value: 'audio/*' }
]

const excelTypeList = [
  { label: 'XLS', value: '.xls' },
  { label: 'XLSX', value: '.xlsx' }
]

const wordTypeList = [
  { label: 'DOC', value: '.doc' },
  { label: 'DOCX', value: '.docx' }
]

const padTypeList = [
  { label: 'pdf', value: '.pdf' }
]

const txtTypeList = [
  { label: 'txt', value: '.txt' }
]

const compressedTypeList = [
  { label: 'rar', value: '.rar' },
  { label: 'zip', value: '.zip' },
  { label: '7-zip', value: '.7-zip' },
  { label: 'tar', value: '.tar' },
  { label: 'GZip', value: '.gzip' },
  { label: 'JAR', value: '.jar' },
  { label: 'ISO', value: '.iso' },
  { label: 'Z', value: '.z' },
  { label: 'UUE', value: '.uue' }
]
const tipsPlacement = [
  { value: 'top-start', label: '上左' },
  { value: 'top', label: '上边' },
  { value: 'top-end', label: '上右' },
  { value: 'left-start', label: '左上' },
  { value: 'left', label: '左边' },
  { value: 'left-end', label: '左下' },
  { value: 'right-start', label: '右上' },
  { value: 'right', label: '右边' },
  { value: 'right-end', label: '右下' },
  { value: 'bottom-start', label: '下左' },
  { value: 'bottom', label: '下边' },
  { value: 'bottom-end', label: '下右' }
]

export {
  fileTyleList,
  imageTyleList,
  vedioTyleList,
  audioTypeList,
  excelTypeList,
  wordTypeList,
  padTypeList,
  txtTypeList,
  compressedTypeList,
  tipsPlacement
}
