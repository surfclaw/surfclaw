import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

def create_pitch_deck():
    prs = Presentation()
    
    # 16:9 Widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # Layout definitions
    title_layout = prs.slide_layouts[0]
    content_layout = prs.slide_layouts[1]
    blank_layout = prs.slide_layouts[6]
    
    # Premium Curated Color Palette (Vibrant Neon accents on deep space background)
    SPACE_BLACK = RGBColor(10, 12, 16)      # Deepest background
    PURE_WHITE = RGBColor(240, 246, 252)    # Main text
    CYAN_ELECTRIC = RGBColor(88, 166, 255)  # Actionable headers
    NEON_GREEN = RGBColor(57, 219, 100)     # Positive metrics / highlights
    CHARCOAL_MUTED = RGBColor(139, 148, 158)# Secondary labels
    WARNING_RED = RGBColor(248, 113, 113)   # Issues/cons
    
    def set_premium_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = SPACE_BLACK

    # ----------------------------------------------------
    # Slide 1: Title Slide (Premium Pitch Deck Cover)
    # ----------------------------------------------------
    slide = prs.slides.add_slide(title_layout)
    set_premium_background(slide)
    
    title_box = slide.shapes.title
    title_box.text = "SURFCLAW"
    for paragraph in title_box.text_frame.paragraphs:
        paragraph.font.size = Pt(72)
        paragraph.font.bold = True
        paragraph.font.color.rgb = CYAN_ELECTRIC
        paragraph.font.name = "Segoe UI"
        paragraph.alignment = PP_ALIGN.CENTER
        
    subtitle_box = slide.placeholders[1]
    subtitle_box.text = "The High-Performance AI Agent OS for DePIN Compute Networks\nAccelerated Runtime  |  Hardware-Level MicroVM Isolation  |  Auto-Resiliency"
    for paragraph in subtitle_box.text_frame.paragraphs:
        paragraph.font.size = Pt(18)
        paragraph.font.color.rgb = CHARCOAL_MUTED
        paragraph.font.name = "Segoe UI"
        paragraph.alignment = PP_ALIGN.CENTER

    # ----------------------------------------------------
    # Slide 2: The Problem (Market Pain Points)
    # ----------------------------------------------------
    slide = prs.slides.add_slide(content_layout)
    set_premium_background(slide)
    
    title_box = slide.shapes.title
    title_box.text = "01. The Problem: Critical Pain Points in DePIN Mining"
    title_box.text_frame.paragraphs[0].font.size = Pt(28)
    title_box.text_frame.paragraphs[0].font.bold = True
    title_box.text_frame.paragraphs[0].font.color.rgb = CYAN_ELECTRIC
    title_box.text_frame.paragraphs[0].font.name = "Segoe UI"
    
    tf = slide.placeholders[1].text_frame
    tf.clear()
    
    p = tf.add_paragraph()
    p.text = "• Frequent GPU VRAM OOM (Out-of-Memory) Crashes"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = PURE_WHITE
    p.font.name = "Segoe UI"
    p2 = tf.add_paragraph()
    p2.text = "  - Concurrent LLM requests trigger sudden memory overflow, crashing nodes and causing severe downtime."
    p2.font.size = Pt(13)
    p2.font.color.rgb = CHARCOAL_MUTED
    p2.font.name = "Segoe UI"
    
    p3 = tf.add_paragraph()
    p3.text = "• Severe Validation Penalties from Minor Formatting Errors"
    p3.font.size = Pt(15)
    p3.font.bold = True
    p3.font.color.rgb = PURE_WHITE
    p3.font.name = "Segoe UI"
    p4 = tf.add_paragraph()
    p4.text = "  - Simple LLM syntax errors (missing brackets, commas) cause validator parsing fails, leading to 15s timeout penalties."
    p4.font.size = Pt(13)
    p4.font.color.rgb = CHARCOAL_MUTED
    p4.font.name = "Segoe UI"

    p5 = tf.add_paragraph()
    p5.text = "• Code Execution Vulnerabilities & Key Theft Risks"
    p5.font.size = Pt(15)
    p5.font.bold = True
    p5.font.color.rgb = PURE_WHITE
    p5.font.name = "Segoe UI"
    p6 = tf.add_paragraph()
    p6.text = "  - Running unverified validator task scripts directly exposes node API keys and hotkey wallet mnemonics to RCE hacks."
    p6.font.size = Pt(13)
    p6.font.color.rgb = CHARCOAL_MUTED
    p6.font.name = "Segoe UI"

    p7 = tf.add_paragraph()
    p7.text = "• Boilerplate Token Bloat driving Latency and Cost"
    p7.font.size = Pt(15)
    p7.font.bold = True
    p7.font.color.rgb = PURE_WHITE
    p7.font.name = "Segoe UI"
    p8 = tf.add_paragraph()
    p8.text = "  - Chatty conversational filler output from LLMs increases payload sizes, bloating bandwidth and incurring latency penalties."
    p8.font.size = Pt(13)
    p8.font.color.rgb = CHARCOAL_MUTED
    p8.font.name = "Segoe UI"

    # ----------------------------------------------------
    # Slide 3: The Solution (Technical Breakthrough)
    # ----------------------------------------------------
    slide = prs.slides.add_slide(content_layout)
    set_premium_background(slide)
    
    title_box = slide.shapes.title
    title_box.text = "02. The Solution: Hardware-Level System Optimization"
    title_box.text_frame.paragraphs[0].font.size = Pt(28)
    title_box.text_frame.paragraphs[0].font.bold = True
    title_box.text_frame.paragraphs[0].font.color.rgb = CYAN_ELECTRIC
    title_box.text_frame.paragraphs[0].font.name = "Segoe UI"
    
    tf = slide.placeholders[1].text_frame
    tf.clear()
    
    p1 = tf.add_paragraph()
    p1.text = "• Rust-Based Thread-Safe VRAM Scheduler"
    p1.font.size = Pt(15)
    p1.font.bold = True
    p1.font.color.rgb = PURE_WHITE
    p1.font.name = "Segoe UI"
    p2 = tf.add_paragraph()
    p2.text = "  - Actively throttles and queues over-limit requests, keeping VRAM stable and reducing OOM crash rate to 0%."
    p2.font.size = Pt(13)
    p2.font.color.rgb = CHARCOAL_MUTED
    p2.font.name = "Segoe UI"

    p3 = tf.add_paragraph()
    p3.text = "• Dynamic Schema SapParser"
    p3.font.size = Pt(15)
    p3.font.bold = True
    p3.font.color.rgb = PURE_WHITE
    p3.font.name = "Segoe UI"
    p4 = tf.add_paragraph()
    p4.text = "  - Automatically recovers and maps JSON structures to expected synapse schemas on-the-fly under microseconds."
    p4.font.size = Pt(13)
    p4.font.color.rgb = CHARCOAL_MUTED
    p4.font.name = "Segoe UI"

    p5 = tf.add_paragraph()
    p5.text = "• Deterministic AST Code Sanitizer & Mapper"
    p5.font.size = Pt(15)
    p5.font.bold = True
    p5.font.color.rgb = PURE_WHITE
    p5.font.name = "Segoe UI"
    p6 = tf.add_paragraph()
    p6.text = "  - Scans code tree nodes locally to intercept forbidden system imports and exec/eval operations before execution under 1µs."
    p6.font.size = Pt(13)
    p6.font.color.rgb = CHARCOAL_MUTED
    p6.font.name = "Segoe UI"

    p7 = tf.add_paragraph()
    p7.text = "• Boilerplate Token Compressor"
    p7.font.size = Pt(15)
    p7.font.bold = True
    p7.font.color.rgb = PURE_WHITE
    p7.font.name = "Segoe UI"
    p8 = tf.add_paragraph()
    p8.text = "  - Strips out conversational noise and filler phrases on-device, compressing payload sizes by 65-75% for speed."
    p8.font.size = Pt(13)
    p8.font.color.rgb = CHARCOAL_MUTED
    p8.font.name = "Segoe UI"

    # ----------------------------------------------------
    # Slide 4: Before vs After (Sleek Comparison Table)
    # ----------------------------------------------------
    slide = prs.slides.add_slide(blank_layout)
    set_premium_background(slide)
    
    tx_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(12.33), Inches(0.8))
    tf = tx_box.text_frame
    p = tf.paragraphs[0]
    p.text = "03. Before vs After: The Paradigm Shift"
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = CYAN_ELECTRIC
    p.font.name = "Segoe UI"
    
    rows = 7
    cols = 4
    left = Inches(0.5)
    top = Inches(1.5)
    width = Inches(12.33)
    height = Inches(5.0)
    
    table_shape = slide.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table
    
    table.columns[0].width = Inches(2.3)  # Metric
    table.columns[1].width = Inches(3.0)  # Before
    table.columns[2].width = Inches(3.5)  # After
    table.columns[3].width = Inches(3.5)  # Impact
    
    headers = ["Metric / Benchmark", "Before (Original Python)", "After (Surfclaw 2.0 Rust OS)", "Business Impact (Value Prop)"]
    data = [
        ["Avg. Execution Latency", "1.76s - 2.10s (GIL Bottleneck)", "0.42s - 0.60s (GIL Bypassed)", "400%+ Faster Execution Speed"],
        ["VRAM Resource Control", "Unmanaged peaks, causing OOM crashes", "Safe queuing, resource budget tracking", "0% Node Downtime Achieved"],
        ["Security Boot Latency", "Docker/VM initialization: 2.50s - 5.00s", "Firecracker UDS socket boot: 0.12s (120ms)", "95%+ Security Overhead Reduction"],
        ["JSON Parse Resiliency", "Output schema errors prompt 15s timeout", "SapParser real-time JSON repair", "0% Format-related Penalty Rate"],
        ["Mining Rewards Yield", "Low weights due to execution delays", "Consistently high weights, maximizing emissions", "Maximized Delegated Staking APY (Optimum Yields)"],
        ["Operational Experience", "Sleepless nights monitoring node crashes", "Passive node maintenance (Sleep soundly)", "Zero Operational Stress & Fatigue"]
    ]
    
    for c, header in enumerate(headers):
        cell = table.cell(0, c)
        cell.text = header
        cell.fill.solid()
        cell.fill.fore_color.rgb = CYAN_ELECTRIC
        for p in cell.text_frame.paragraphs:
            p.font.size = Pt(12)
            p.font.bold = True
            p.font.color.rgb = SPACE_BLACK
            p.font.name = "Segoe UI"
            p.alignment = PP_ALIGN.CENTER
            
    for r, row_data in enumerate(data):
        for c, val in enumerate(row_data):
            cell = table.cell(r + 1, c)
            cell.text = val
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(20, 24, 33)
            for p in cell.text_frame.paragraphs:
                p.font.size = Pt(11)
                p.font.name = "Segoe UI"
                if c == 0:
                    p.font.bold = True
                    p.font.color.rgb = CYAN_ELECTRIC
                elif c == 2:
                    p.font.bold = True
                    p.font.color.rgb = NEON_GREEN
                else:
                    p.font.color.rgb = PURE_WHITE
                p.alignment = PP_ALIGN.LEFT if c != 0 else PP_ALIGN.CENTER

    # ----------------------------------------------------
    # Slide 5: Core Strengths (Pros & Cons)
    # ----------------------------------------------------
    slide = prs.slides.add_slide(content_layout)
    set_premium_background(slide)
    
    title_box = slide.shapes.title
    title_box.text = "04. Strategic Profile: Pros & Cons Analysis"
    title_box.text_frame.paragraphs[0].font.size = Pt(28)
    title_box.text_frame.paragraphs[0].font.bold = True
    title_box.text_frame.paragraphs[0].font.color.rgb = CYAN_ELECTRIC
    title_box.text_frame.paragraphs[0].font.name = "Segoe UI"
    
    tf = slide.placeholders[1].text_frame
    tf.clear()
    
    p = tf.add_paragraph()
    p.text = "👍 Core Strengths (Pros)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = NEON_GREEN
    p.font.name = "Segoe UI"
    
    strengths = [
        "Hardware-free performance scaling: Boost APY yields without purchasing expensive enterprise GPUs.",
        "Zero-Trust Sandboxing: AWS Firecracker isolates validator executables, securing wallet private keys.",
        "Auto-Heal Formatting: Microsecond SapParser intercepts syntax errors before validators issue penalties."
    ]
    for s in strengths:
        p_s = tf.add_paragraph()
        p_s.text = f"  - {s}"
        p_s.font.size = Pt(13)
        p_s.font.color.rgb = PURE_WHITE
        p_s.font.name = "Segoe UI"
        
    p_c = tf.add_paragraph()
    p_c.text = "\n👎 Technical Considerations (Cons)"
    p_c.font.size = Pt(18)
    p_c.font.bold = True
    p_c.font.color.rgb = WARNING_RED
    p_c.font.name = "Segoe UI"
    
    cons = [
        "Linux-exclusive optimization: Windows environments are supported solely for dry-run compiling checks.",
        "Initial configuration requirements: Setup scripts require local rust compiler installation flags."
    ]
    for c in cons:
        p_c_item = tf.add_paragraph()
        p_c_item.text = f"  - {c}"
        p_c_item.font.size = Pt(13)
        p_c_item.font.color.rgb = PURE_WHITE
        p_c_item.font.name = "Segoe UI"

    # ----------------------------------------------------
    # Slide 6: The Roadmap (Future Development Milestones)
    # ----------------------------------------------------
    slide = prs.slides.add_slide(content_layout)
    set_premium_background(slide)
    
    title_box = slide.shapes.title
    title_box.text = "05. Future Roadmap & Strategic Execution"
    title_box.text_frame.paragraphs[0].font.size = Pt(28)
    title_box.text_frame.paragraphs[0].font.bold = True
    title_box.text_frame.paragraphs[0].font.color.rgb = CYAN_ELECTRIC
    title_box.text_frame.paragraphs[0].font.name = "Segoe UI"
    
    tf = slide.placeholders[1].text_frame
    tf.clear()
    
    milestones = [
        ("Phase 1: Kernel Hardening (Q1 2026)", "Complete clean-room scheduling migration to bypass GIL bottlenecks entirely. Reached 3.5x speed gains."),
        ("Phase 2: Security & Resiliency Porting (Q2 2026)", "Deploy AWS Firecracker isolation and BAML SapParser JSON healing to eliminate formatting penalties."),
        ("Phase 3: Multi-Subnet Adaptation (Q3 2026)", "Incorporate Bittensor API auto-monitoring to adapt output assertion schemas dynamically during updates."),
        ("Phase 4: Direct Weight Wholesaling (Q4 2026)", "Offer secure offline local compilation packages to private enterprise node clients.")
    ]
    
    for title, desc in milestones:
        p_m = tf.add_paragraph()
        p_m.text = f"• {title}"
        p_m.font.size = Pt(14)
        p_m.font.bold = True
        p_m.font.color.rgb = CYAN_ELECTRIC
        p_m.font.name = "Segoe UI"
        
        p_d = tf.add_paragraph()
        p_d.text = f"  - {desc}"
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = CHARCOAL_MUTED
        p_d.font.name = "Segoe UI"

    # Save presentation
    output_path = os.path.join(os.path.dirname(__file__), "Surfclaw_Pitch_Deck.pptx")
    prs.save(output_path)
    print(f"[SUCCESS] PowerPoint Pitch Deck generated successfully: {output_path}")

if __name__ == "__main__":
    create_pitch_deck()
