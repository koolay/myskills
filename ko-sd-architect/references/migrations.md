# Migration Rules

Read when a proposal breaks consumer compatibility or changes persisted formats. Apply only the rules relevant to the change; carry the resulting conditions into the architecture recommendation.

1. Inventory affected consumers and readers/writers, including versions that coexist during rollout. Specify the compatibility contract and who owns each transition. Honor the requested migration while preserving explicit public commitments.
2. Choose an order based on actual compatibility. An additive change may allow expansion, consumer adoption, producer switching, then removal; an incompatible change may require version coexistence. Set a condition for removing the old contract.
3. Define the rollout signal, observation window, and stop threshold. Mark proposed thresholds and unresolved operational owners explicitly.
4. Specify what code rollback can recover and what happens to data already written. Establish whether the old version can read new data, whether restoration or a reverse transformation is possible, or whether recovery must roll forward. Obtain authorization before destructive conversion or irreversible execution outside approved scope.
5. Plan checks across real consumers/producers and old/new versions, including partial rollout and applicable failure recovery. Keep unexecuted checks planned or blocked.

**Complete when:** Every affected consumer and persisted format has a transition and recovery disposition; rollout has a signal and stop condition; mixed-version and recovery checks have statuses. Unresolved conditions remain explicit blockers or limits on the provisional recommendation.
