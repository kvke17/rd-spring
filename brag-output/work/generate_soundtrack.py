import math
import wave
import struct

def synthesize_audio():
    sample_rate = 44100
    duration = 20.0
    total_samples = int(sample_rate * duration)
    
    # Pre-allocate audio buffer [left, right]
    left = [0.0] * total_samples
    right = [0.0] * total_samples

    # Frequencies
    # Chords:
    # 0.0 - 4.5s: Dm9 (D2=73.42, A2=110, F3=174.61, A3=220, C4=261.63, E4=329.63)
    # 4.5 - 9.5s: Bbmaj7 (Bb2=58.27, D3=146.83, F3=174.61, A3=220, D4=293.66)
    # 9.5 - 15.0s: Gm9 (G2=98.0, D3=146.83, F3=174.61, Bb3=233.08, D4=293.66)
    # 15.0 - 20.0s: Dm (D2=73.42, A2=110, D3=146.83, F3=174.61, A3=220, D4=293.66)

    def get_chord_notes(t):
        if t < 4.5:
            return [(73.42, 0.28), (110.0, 0.22), (174.61, 0.18), (220.0, 0.16), (261.63, 0.12), (329.63, 0.10)]
        elif t < 9.5:
            return [(58.27, 0.30), (116.54, 0.22), (174.61, 0.18), (220.0, 0.16), (293.66, 0.12)]
        elif t < 15.0:
            return [(98.00, 0.28), (146.83, 0.22), (174.61, 0.18), (233.08, 0.16), (293.66, 0.12)]
        else:
            return [(73.42, 0.30), (110.0, 0.24), (146.83, 0.20), (174.61, 0.16), (220.0, 0.14), (293.66, 0.10)]

    # Sub-bass drone (55Hz / 73.4Hz continuous)
    for i in range(total_samples):
        t = i / sample_rate

        # Master envelope
        if t < 1.5:
            env = t / 1.5
        elif t > 17.5:
            env = max(0.0, (20.0 - t) / 2.5)
        else:
            env = 1.0

        # Sub-bass rumble (A0/D1 55Hz & 73.4Hz with subtle 0.2Hz movement)
        sub_lfo = 1.0 + 0.15 * math.sin(2 * math.pi * 0.2 * t)
        sub = 0.22 * math.sin(2 * math.pi * 55.0 * t) + 0.18 * math.sin(2 * math.pi * 73.42 * t)
        sub *= env * sub_lfo

        # Chord notes
        notes = get_chord_notes(t)
        chord_l = 0.0
        chord_r = 0.0

        for freq, weight in notes:
            # Stereo detune for width
            detune_l = freq * 0.998
            detune_r = freq * 1.002
            # Add harmonic overtones
            osc_l = math.sin(2 * math.pi * detune_l * t) + 0.35 * math.sin(4 * math.pi * detune_l * t)
            osc_r = math.sin(2 * math.pi * detune_r * t) + 0.35 * math.sin(4 * math.pi * detune_r * t)
            chord_l += osc_l * weight
            chord_r += osc_r * weight

        # Subtle suspension air hiss / whoosh around 0.5s to 2.5s
        air_whoosh = 0.0
        if 0.5 <= t <= 2.5:
            w_env = math.sin((t - 0.5) / 2.0 * math.pi)
            noise = ((math.sin(t * 12345.6) * 43758.5453) % 1.0) * 2.0 - 1.0
            air_whoosh = noise * 0.03 * w_env

        # High-tech mechanical transition clicks at 4.5s, 9.5s, 15.0s
        click = 0.0
        for transition_t in [4.5, 9.5, 15.0]:
            dt = t - transition_t
            if 0.0 <= dt < 0.12:
                decay = math.exp(-dt * 45.0)
                click += math.sin(2 * math.pi * 1800.0 * dt) * 0.15 * decay
                click += math.sin(2 * math.pi * 880.0 * dt) * 0.10 * decay

        sample_l = (sub * 0.9 + chord_l * 0.35 * env + air_whoosh + click)
        sample_r = (sub * 0.9 + chord_r * 0.35 * env + air_whoosh + click)

        left[i] = sample_l
        right[i] = sample_r

    # Normalization & soft limiter
    max_val = max(max(abs(x) for x in left), max(abs(x) for x in right))
    target_peak = 0.88
    gain = (target_peak / max_val) if max_val > 0 else 1.0

    output_path = 'brag-output/work/soundtrack.wav'
    with wave.open(output_path, 'w') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        
        frames = bytearray()
        for i in range(total_samples):
            # Soft clip with tanh
            val_l = math.tanh(left[i] * gain)
            val_r = math.tanh(right[i] * gain)
            int_l = int(val_l * 32767.0)
            int_r = int(val_r * 32767.0)
            frames.extend(struct.pack('<hh', int_l, int_r))
        
        wav.writeframes(frames)
    
    print(f"[OK] Soundtrack generated: {output_path} ({duration}s, 44.1kHz stereo)")

if __name__ == '__main__':
    synthesize_audio()
