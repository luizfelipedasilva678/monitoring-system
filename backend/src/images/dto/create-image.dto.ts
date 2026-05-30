import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50_000_000)
  data!: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsUUID()
  motionEventId?: string;
}
