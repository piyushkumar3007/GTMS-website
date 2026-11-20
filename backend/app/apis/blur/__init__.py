from fastapi import APIRouter, HTTPException, Response
from PIL import Image
import io
import os

router = APIRouter()

@router.get("/api/blur{path:path}")
async def blur_image(path: str, w: int = 50):
    try:
        # Get the full path to the image in the public folder
        image_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))),
            "..", "frontend", "public", path.lstrip("/")
        )

        # Open and process the image
        with Image.open(image_path) as img:
            # Calculate height to maintain aspect ratio
            aspect_ratio = img.height / img.width
            h = int(w * aspect_ratio)

            # Resize the image
            img = img.resize((w, h), Image.Resampling.LANCZOS)

            # Convert to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format=img.format or 'JPEG', quality=60)
            img_byte_arr.seek(0)

            return Response(
                content=img_byte_arr.getvalue(),
                media_type=f"image/{img.format.lower() if img.format else 'jpeg'}"
            )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Image not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
