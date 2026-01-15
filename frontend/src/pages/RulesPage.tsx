import React from 'react';

const RulesPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <h1 className="text-4xl font-bold mb-8 text-white">How to Play Sequence</h1>

            <div className="space-y-12">
                <Section title="Objective">
                    <p>
                        The goal is to form a <strong>Sequence</strong>: a connected line of 5 chips of the same color, either horizontally, vertically, or diagonally.
                        <br /><br />
                        - <strong>2 Players/Teams:</strong> You need <strong>2 Sequences</strong> to win.
                        <br />
                        - <strong>3 Teams:</strong> You need <strong>1 Sequence</strong> to win.
                    </p>
                </Section>

                <Section title="The Jacks (Special Cards)">
                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                        <CardRule
                            type="Two-Eyed Jack"
                            visual="👁️👁️"
                            color="text-blue-400"
                            desc="Wild Card. Place a chip on ANY open space."
                        />
                        <CardRule
                            type="One-Eyed Jack"
                            visual="👁️"
                            color="text-red-400"
                            desc="Anti-Wild Card. REMOVE an opponent's chip from an open space. (Cannot remove from a completed sequence)."
                        />
                    </div>
                </Section>

                <Section title="Dead Cards">
                    <p>
                        If you hold a card that cannot be played (because all corresponding spaces on the board are covered), it is a <strong>Dead Card</strong>.
                        <br />
                        You may discard it and draw a new one at the start of your turn.
                        <br /><br />
                        <em>Note: In this digital version, the game detects dead cards automatically or provides a button to clear them.</em>
                    </p>
                </Section>

                <Section title="Corner Spaces">
                    <p>
                        The 4 corners of the board are <strong>Free Spaces</strong>. All players can use them as if they were their own colored chip.
                        <br />
                        You only need 4 chips connected to a corner to complete a Sequence of 5.
                    </p>
                </Section>
            </div>
        </div>
    );
};

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <h2 className="text-2xl font-bold text-blue-400 mb-4">{title}</h2>
        <div className="text-slate-300 leading-relaxed text-lg">
            {children}
        </div>
    </section>
);

const CardRule = ({ type, visual, color, desc }: any) => (
    <div className="bg-black/30 p-4 rounded-xl border border-slate-700">
        <div className={`text-2xl font-bold mb-2 ${color}`}>{visual} {type}</div>
        <p className="text-slate-400">{desc}</p>
    </div>
);

export default RulesPage;
