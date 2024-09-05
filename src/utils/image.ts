import Canvas from '@napi-rs/canvas';
import { GuildMember } from 'discord.js';

import { resolve } from 'path';

Canvas.GlobalFonts.loadFontsFromDir(resolve(process.cwd(), 'assets/fonts'));

class Image {
  static width = 2000;
  static height = 2000;

  static colors = {
    shadowBlack: '#202225',
    statusGreen: '#43b581',
    statusRed: '#f04747',
    statusYellow: '#faa61a',
    statusGray: '#747f8d'
  };
  public static loadFont(font: Buffer, name: string) {
    return Canvas.GlobalFonts.register(font, name);
  }

  protected static drawArc(ctx: Canvas.SKRSContext2D, arcOptions: ArcOptions) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(arcOptions.x, arcOptions.y, arcOptions.radius, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.fillStyle = arcOptions.outLineColor || this.colors.shadowBlack;

    ctx.fillRect(0, 0, this.width, this.height);

    ctx.closePath();
    ctx.restore();
    ctx.save();
    if (!arcOptions.image) return;
    ctx.beginPath();
    ctx.arc(arcOptions.x, arcOptions.y, arcOptions.radius - arcOptions.outLine, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.strokeStyle = 'black';

    ctx.drawImage(
      arcOptions.image,
      arcOptions.x - arcOptions.radius + arcOptions.outLine,
      arcOptions.y - arcOptions.radius + arcOptions.outLine,
      arcOptions.radius * 2 - arcOptions.outLine * 2,
      arcOptions.radius * 2 - arcOptions.outLine * 2
    );
    ctx.closePath();
    ctx.restore();
  }

  protected static writeText(ctx: Canvas.SKRSContext2D, textOptions: TextOptions) {
    do {
      ctx.font = `${textOptions.fontSize}px ${textOptions.fonts.join(', ')}`;
    } while (ctx.measureText(textOptions.text).width > textOptions.maxWidth && textOptions.fontSize--);
    ctx.fillStyle = textOptions.color;
    ctx.textAlign = textOptions.align;
    ctx.textBaseline = textOptions.baseline;
    ctx.fillText(textOptions.text, textOptions.x, textOptions.y);
    if (!textOptions.strokeColor) return ctx.measureText(textOptions.text);
    ctx.strokeStyle = `${textOptions.strokeColor || 'black'}`;
    ctx.lineWidth = 2;
    ctx.strokeText(textOptions.text, textOptions.x, textOptions.y);

    return ctx.measureText(textOptions.text);
  }

  static async getProfile(member: GuildMember) {
    const width = this.width;
    const height = this.height;

    const highestRoleColor = member?.displayHexColor || this.colors.shadowBlack;
    let statusColor: string | null = null;

    switch (member?.presence?.status) {
      case 'online':
        statusColor = this.colors.statusGreen;
        break;
      case 'dnd':
        statusColor = this.colors.statusRed;
        break;
      case 'idle':
        statusColor = this.colors.statusYellow;
        break;
      case 'offline':
      case 'invisible':
        statusColor = this.colors.statusGray;
        break;

      default:
        statusColor = this.colors.statusGray;
    }

    const canvas = Canvas.createCanvas(width, width);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = this.colors.shadowBlack;

    ctx.fillRect(0, 0, width, height);

    const avatar = await Canvas.loadImage(member.displayAvatarURL({ extension: 'png', size: 4096 }), {
      alt: 'avatar'
    });
    const icon = member.guild.icon
      ? await Canvas.loadImage(member.guild.iconURL({ extension: 'png', size: 4096 }) || '', {
          alt: 'icon'
        })
      : null;

    const arc = {
      x: width / 7 + 10,
      y: height / 6,
      radius: width / 7
    };

    this.drawArc(ctx, {
      ...arc,
      image: avatar,
      outLine: 5,
      outLineColor: statusColor
    });

    const gap = arc.x + arc.radius;
    const x = width / 2 + gap / 2; //- w / 2;
    const name = member.user.displayName || member.user.username;

    this.writeText(ctx, {
      x,
      y: arc.y,
      text: name,
      fonts: ['Roboto', 'Noto Sans Arabic'],
      fontSize: arc.radius,
      maxWidth: width - gap - 10,
      color: highestRoleColor,
      align: 'center',
      baseline: 'middle',
      strokeColor: 'black'
    });

    if (icon)
      this.drawArc(ctx, {
        x: width / 2,
        y: height - width / 12 - 5,
        radius: width / 12,
        outLine: 1,
        outLineColor: 'black',
        image: icon
      });

    const buffer = canvas.toBuffer('image/png');
    return buffer;
  }

  static async generateCertificate(config: CertificateOptions) {
    const certificateImage = config.image;

    const { width, height } = certificateImage.info;

    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const certificate = await Canvas.loadImage(certificateImage.data);
    ctx.drawImage(certificate, 0, 0, width, height);

    const textData = this.writeText(ctx, config.textConfig);

    return {
      data: canvas.toBuffer('image/png'),
      textData
    };
  }
}

export { Image };
