/** JS imports */
const { round } = Math;

/** Gnome libs imports */
const { Gio, GLib, Clutter, GObject } = imports.gi;
const Main = imports.ui.main;

/** Extension imports */
const Me = imports.misc.extensionUtils.getCurrentExtension();
const {
    BaseTilingLayout,
} = Me.imports.src.layout.msWorkspace.tilingLayouts.baseTiling;
const {
    SetAllocation,
    Allocate,
    AllocatePreferredSize,
} = Me.imports.src.utils.compatibility;
const { getSettings } = Me.imports.src.utils.settings;
const { MsWindow } = Me.imports.src.layout.msWorkspace.msWindow;
const { Portion } = Me.imports.src.layout.msWorkspace.portion;

/* exported BaseTilingLayout */
var BaseResizeableTilingLayout = GObject.registerClass(
    class BaseResizeableTilingLayout extends BaseTilingLayout {
        _init(msWorkspace, state = {}) {
            this.mainPortion = new Portion();

            if (state.mainPortion) {
                this.mainPortion.state = state.mainPortion;

                delete state.mainPortion;
            }

            super._init(msWorkspace, state);
        }

        get state() {
            return Object.assign({}, this._state, {
                mainPortion: this.mainPortion.state,
            });
        }

        getTileableIndex(tileable) {
            return this.tileableListVisible.indexOf(tileable);
        }

        getTileablePortionRatio(tileable) {
            const index = this.getTileableIndex(tileable);

            if (index < 0) {
                return;
            }

            return this.mainPortion.getRatioForIndex(index);
        }

        getTileableBorder(tileable, vertical = false, after = false) {
            const index = this.getTileableIndex(tileable);

            if (index < 0) {
                return;
            }

            return this.mainPortion.getBorderForIndex(index, vertical, after);
        }

        applyBoxRatio(box, ratio) {
            return {
                x: round(box.x1 + ratio.x * box.get_width()),
                y: round(box.y1 + ratio.y * box.get_height()),
                width: round(ratio.width * box.get_width()),
                height: round(ratio.height * box.get_height()),
            };
        }

        applyBoxRatioAndGaps(box, ratio) {
            const { x, y, width, height } = this.applyBoxRatio(box, ratio);

            return this.applyGaps(x, y, width, height);
        }

        tileTileable(tileable, box) {
            let ratio = this.getTileablePortionRatio(tileable);

            if (!ratio) {
                return;
            }

            const { x, y, width, height } = this.applyBoxRatioAndGaps(
                box,
                ratio
            );

            tileable.x = x;
            tileable.y = y;
            tileable.width = width;
            tileable.height = height;
        }

        updateMainPortionLength(length) {
            while (this.mainPortion.portionLength > length) {
                this.mainPortion.pop();
            }

            while (length > 1 && this.mainPortion.portionLength < length) {
                this.mainPortion.push();
            }
        }

        tileAll(box) {
            this.updateMainPortionLength(this.tileableListVisible.length);

            super.tileAll(box);
        }
    }
);
