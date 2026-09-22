from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    capabilities: List[str]

class ImageUploadRequest(BaseModel):
    image: str = Field(..., description="Base64 data URL of the image")
    name: Optional[str] = "image"
    type: Optional[str] = "image/png"
    size: Optional[int] = None

class ImageConvertRequest(BaseModel):
    image: str = Field(..., description="Base64 data URL of the image")
    targetFormat: str = Field(..., pattern="^(png|jpg|jpeg|webp)$")
    quality: Optional[int] = Field(90, ge=10, le=100)

class ImageResizeRequest(BaseModel):
    image: str
    width: int = Field(..., gt=0, le=8000)
    height: int = Field(..., gt=0, le=8000)
    maintainAspectRatio: Optional[bool] = True

class ImageCropRequest(BaseModel):
    image: str
    x: int = Field(..., ge=0)
    y: int = Field(..., ge=0)
    width: int = Field(..., gt=0)
    height: int = Field(..., gt=0)

class ImageRotateRequest(BaseModel):
    image: str
    degrees: float = Field(..., description="Rotation angle in degrees (90, 180, 270, etc.)")

class ImageFlipRequest(BaseModel):
    image: str
    horizontal: Optional[bool] = False
    vertical: Optional[bool] = False

class ImageAdjustRequest(BaseModel):
    image: str
    brightness: Optional[float] = 100.0 # 0 - 200
    contrast: Optional[float] = 100.0   # 0 - 200
    saturation: Optional[float] = 100.0 # 0 - 200
    temperature: Optional[float] = 0.0  # -100 to 100
    tint: Optional[float] = 0.0         # -100 to 100
    exposure: Optional[float] = 0.0     # -100 to 100

class ImageFilterRequest(BaseModel):
    image: str
    filterType: str = Field(..., pattern="^(none|bw|sepia|vintage|cool|warm|smooth|edges|blur|auto_enhance)$")
    intensity: Optional[int] = Field(100, ge=0, le=100)

class RemoveBackgroundRequest(BaseModel):
    image: str
    method: Optional[str] = "auto" # "auto" or "manual"
    threshold: Optional[int] = 25
    maskData: Optional[str] = None

class MergeLayersRequest(BaseModel):
    layers: List[Dict[str, Any]]
    width: int = 1080
    height: int = 1080
    background: Optional[Dict[str, Any]] = None

class ExportRequest(BaseModel):
    imageData: str
    format: str = "png"
    quality: int = 92
    fileName: Optional[str] = "pixelora-export"
