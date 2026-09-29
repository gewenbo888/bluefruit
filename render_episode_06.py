#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
蓝果短剧 (BlueFruit) · 第 06 集 竖屏视频全自动渲染与大结局交付引擎
BlueFruit Real Short Drama Episode 06 9:16 Vertical Video Renderer
Title: 《万劫不灭道》第 06 集 · 终局决战与执掌诸天 (Grand Finale)
"""

import os
import sys
import subprocess
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PROJECT_DIR = Path("/Users/geir/Downloads/AI/bluefruit")
OUTPUT_DIR = PROJECT_DIR / "output"
TEMP_DIR = Path("/tmp/bluefruit_render_ep06")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 1080, 1920

SCRIPT_DATA = {
    "title": "万劫不灭道",
    "episode": "第 06 集 · 终局决战与执掌诸天 (大结局)",
    "genre": "玄幻 · Eastern Fantasy",
    "shots": [
        {
            "id": "shot_01",
            "duration": 4.0,
            "heading": "00-04s 终极对决 · 界壁破裂",
            "hook": "万古魔皇真身撕裂虚空！整座大千世界濒临解体！",
            "narration": "九天之外，魔皇真身遮天蔽日！亿万道黑暗神雷轰穿界壁，整座大千世界在这一瞬间濒临彻底坍塌解体！",
            "theme_color": (255, 30, 60),
            "bg_color": (24, 4, 6),
            "accent": "⚡ 魔皇真身 · 界壁崩碎",
        },
        {
            "id": "shot_02",
            "duration": 14.0,
            "heading": "04-18s 极道升华 · 创世青莲",
            "hook": "少年以身化剑！混沌青莲绽放出创世鸿蒙神光！",
            "narration": "少年眼眸中倒映亿万星河，他将自身大道彻底燃尽，化作一道横贯古今的绝世剑光！混沌青莲在虚空中彻底绽放！",
            "theme_color": (0, 220, 255),
            "bg_color": (4, 16, 28),
            "accent": "🌸 混沌盛开 · 创世鸿蒙",
        },
        {
            "id": "shot_03",
            "duration": 30.0,
            "heading": "18-48s 情绪极巅 · 剑斩魔皇执掌万界",
            "hook": "一剑平定纪元动荡！太古魔皇彻底灰飞烟灭！",
            "narration": "轰然一声巨响，黑暗被彻底撕碎！魔皇在绝望咆哮中烟消云散，三千大道神链环绕在少年周身，从此诸天共尊，独断万古！",
            "theme_color": (255, 215, 0),
            "bg_color": (24, 18, 4),
            "accent": "👑 独断万古 · 诸天共尊",
        },
        {
            "id": "shot_04",
            "duration": 12.0,
            "heading": "48-60s 现实主权 · 蓝果第二季启航",
            "hook": "第一季圆满完结！扫码解锁独家未删减版与第二季！",
            "narration": "《万劫不灭道》第一季圆满收官！感谢每一位现实主权践行者的支持，蓝果短剧科幻巨作《深空长城》即将重磅上线！",
            "theme_color": (16, 185, 129),
            "bg_color": (4, 20, 14),
            "accent": "🚀 全剧完结 · 第二季待续",
        },
    ],
}


def get_system_font(size: int, bold: bool = False):
    font_paths = [
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Hiragino Sans GB.ttc",
        "/Library/Fonts/Songti.ttc",
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def render_shot_poster(shot: dict, index: int, total: int) -> Path:
    img = Image.new("RGB", (WIDTH, HEIGHT), shot["bg_color"])
    draw = ImageDraw.Draw(img)

    for y in range(0, HEIGHT, 16):
        draw.line([(0, y), (WIDTH, y)], fill=(shot["theme_color"][0] // 4, shot["theme_color"][1] // 4, shot["theme_color"][2] // 4))

    font_brand = get_system_font(42, bold=True)
    draw.text((80, 100), "蓝果短剧 · BLUEFRUIT", fill=(255, 255, 255), font=font_brand)
    draw.text((80, 160), "12-Node GPU Distributed Pipeline · AI 原生短剧厂牌", fill=(160, 160, 180), font=get_system_font(28))

    draw.rectangle([WIDTH - 320, 100, WIDTH - 80, 165], fill=(30, 30, 45), outline=shot["theme_color"], width=2)
    draw.text((WIDTH - 300, 115), SCRIPT_DATA["genre"], fill=shot["theme_color"], font=get_system_font(28, bold=True))

    draw.text((80, 240), f"🔥 {SCRIPT_DATA['title']}", fill=(255, 255, 255), font=get_system_font(76, bold=True))
    draw.text((80, 335), f"🎬 {SCRIPT_DATA['episode']}", fill=shot["theme_color"], font=get_system_font(44, bold=True))

    draw.rectangle([80, 420, 80 + 380, 480], fill=(25, 25, 38))
    draw.text((100, 435), shot["accent"], fill=(255, 255, 255), font=get_system_font(30, bold=True))

    box_y = 530
    box_h = 760
    draw.rounded_rectangle([70, box_y, WIDTH - 70, box_y + box_h], radius=24, fill=(15, 12, 22), outline=(50, 45, 65), width=2)

    cx, cy = WIDTH // 2, box_y + box_h // 2
    for r in range(320, 40, -40):
        color_step = (
            int(shot["theme_color"][0] * (1 - r / 360)),
            int(shot["theme_color"][1] * (1 - r / 360)),
            int(shot["theme_color"][2] * (1 - r / 360))
        )
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color_step, width=2)

    badge_w, badge_h = 700, 120
    draw.rounded_rectangle([cx - badge_w // 2, cy - badge_h // 2, cx + badge_w // 2, cy + badge_h // 2], radius=16, fill=(20, 16, 28), outline=shot["theme_color"], width=3)
    draw.text((cx - 280, cy - 35), f"FINALE · ACT {index + 1} / {total}", fill=(255, 255, 255), font=get_system_font(38, bold=True))

    draw.rounded_rectangle([80, 1340, WIDTH - 80, 1500], radius=18, fill=(28, 22, 38), outline=shot["theme_color"], width=2)
    hook_text = shot["hook"]
    draw.text((110, 1375), f"⚡ 终局高潮：{hook_text}", fill=(255, 235, 180), font=get_system_font(34, bold=True))

    narr_box_y = 1530
    draw.rounded_rectangle([80, narr_box_y, WIDTH - 80, narr_box_y + 240], radius=18, fill=(18, 14, 25), outline=(60, 55, 75), width=1)
    draw.text((110, narr_box_y + 25), "🎙️ 旁白原声 (火山哥情绪决战模型)：", fill=(160, 160, 180), font=get_system_font(26))

    words = shot["narration"]
    line1 = words[:22]
    line2 = words[22:44]
    line3 = words[44:66]
    draw.text((110, narr_box_y + 70), line1, fill=(240, 240, 250), font=get_system_font(32))
    if line2:
        draw.text((110, narr_box_y + 115), line2, fill=(240, 240, 250), font=get_system_font(32))
    if line3:
        draw.text((110, narr_box_y + 160), line3, fill=(240, 240, 250), font=get_system_font(32))

    footer_y = 1800
    draw.line([(80, footer_y), (WIDTH - 80, footer_y)], fill=(50, 45, 60), width=2)
    draw.text((80, footer_y + 25), "🌐 官方主站: https://bluefruit.psyverse.fun/ (别名: languoduanju.psyverse.fun)", fill=(180, 180, 200), font=get_system_font(24))
    draw.text((80, footer_y + 60), "💳 极速收银: 微信/支付宝/Base链上秒结 (0% 平台抽成直付) · 现实主权自贩机", fill=(16, 185, 129), font=get_system_font(24, bold=True))

    out_path = TEMP_DIR / f"{shot['id']}.png"
    img.save(out_path, "PNG")
    print(f"🖼️ 已生成分镜海报: {out_path.name}")
    return out_path


def generate_audio_track() -> Path:
    print("🎙️ 正在调用 macOS 语音合成引擎生成第 06 集大结局高张力台词音轨...")
    shot_aiffs = []
    for i, shot in enumerate(SCRIPT_DATA["shots"]):
        txt_path = TEMP_DIR / f"speech_{i}.txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(shot["narration"])

        aiff_path = TEMP_DIR / f"speech_{i}.aiff"
        subprocess.run(["say", "-v", "Tingting", "-r", "185", "-f", str(txt_path), "-o", str(aiff_path)], check=True)
        shot_aiffs.append(aiff_path)

    full_voice = TEMP_DIR / "full_voice.wav"
    filter_inputs = "".join(f"[{i}:a]" for i in range(len(shot_aiffs)))
    filter_complex = f"{filter_inputs}concat=n={len(shot_aiffs)}:v=0:a=1[outa]"

    cmd = ["ffmpeg", "-y"]
    for a in shot_aiffs:
        cmd.extend(["-i", str(a)])
    cmd.extend(["-filter_complex", filter_complex, "-map", "[outa]", str(full_voice)])
    subprocess.run(cmd, check=True, capture_output=True)

    final_audio = TEMP_DIR / "final_bgm_voice.wav"
    bgm_synth = (
        "sine=frequency=65:duration=60[sub];"
        "sine=frequency=130:duration=60[mid];"
        "[sub][mid]amix=inputs=2:weights=0.7 0.3[drone];"
        "[drone]volume=0.35[bgm];"
        "[0:a]volume=1.95[v];"
        "[bgm][v]amix=inputs=2:duration=first:dropout_transition=2[out]"
    )
    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(full_voice),
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-filter_complex", bgm_synth,
        "-map", "[out]",
        "-t", "60",
        str(final_audio)
    ], check=True, capture_output=True)

    print(f"🎵 混音完成: {final_audio}")
    return final_audio


def assemble_video(audio_track: Path) -> Path:
    final_output = OUTPUT_DIR / "BF_XUANHUAN_EP06_DISPATCH.mp4"
    clip_files = []

    for i, shot in enumerate(SCRIPT_DATA["shots"]):
        frame_img = render_shot_poster(shot, i, len(SCRIPT_DATA["shots"]))
        clip_mp4 = TEMP_DIR / f"clip_{i}.mp4"
        dur = shot["duration"]

        if i % 2 == 0:
            zoom_filter = f"scale=1080:1920,zoompan=z='min(zoom+0.0012,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(dur*25)}:s=1080x1920:fps=25"
        else:
            zoom_filter = f"scale=1080:1920,zoompan=z='min(1.15-0.0012*on,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(dur*25)}:s=1080x1920:fps=25"

        cmd = [
            "ffmpeg", "-y",
            "-loop", "1", "-i", str(frame_img),
            "-vf", zoom_filter,
            "-t", str(dur),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "ultrafast",
            str(clip_mp4)
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        clip_files.append(clip_mp4)

    concat_list = TEMP_DIR / "concat_list.txt"
    with open(concat_list, "w") as f:
        for c in clip_files:
            f.write(f"file '{c.resolve()}'\n")

    video_only = TEMP_DIR / "video_merged.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list),
        "-c", "copy", str(video_only)
    ], check=True, capture_output=True)

    print("⚡ 正在合并音画，压制最终 1080x1920 9:16 Universal H.264 视频源文件...")
    mux_cmd = [
        "ffmpeg", "-y",
        "-i", str(video_only),
        "-i", str(audio_track),
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        str(final_output)
    ]
    subprocess.run(mux_cmd, check=True, capture_output=True)
    print(f"🎉 蓝果短剧第六集大结局已渲染成功！源文件位置: {final_output}")
    return final_output


def main():
    print("==================================================================")
    print("🎬 蓝果短剧 (BlueFruit) · 第 06 集大结局 竖屏视频全自动渲染引擎")
    print("==================================================================")
    audio = generate_audio_track()
    output_mp4 = assemble_video(audio)
    file_size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
    print(f"📊 产物信息：分辨率 1080x1920 | 格式 MP4 (H.264+AAC) | 体积: {file_size_mb:.2f} MB")


if __name__ == "__main__":
    main()
