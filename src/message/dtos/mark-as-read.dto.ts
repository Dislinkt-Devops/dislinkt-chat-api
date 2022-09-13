import { Type } from 'class-transformer';
import { IsDate, IsNumber, MaxDate, ValidateIf } from 'class-validator';

export class MarkAsRead {
  @IsNumber()
  receiver: number;

  @IsNumber({}, { each: true })
  @ValidateIf((o) => !o.timestamp)
  id: number[];

  @IsDate()
  @MaxDate(new Date())
  @Type(() => Date)
  @ValidateIf((o) => !o.id || o.id.length === 0)
  timestamp: Date;
}
