-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "motionEventId" TEXT;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_motionEventId_fkey" FOREIGN KEY ("motionEventId") REFERENCES "MotionEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
